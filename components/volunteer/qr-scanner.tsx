"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import jsQR from "jsqr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Upload, CheckCircle, AlertCircle, LogOut } from "lucide-react"
import { getParticipantByQRData, checkInParticipant, isParticipantCheckedIn } from "@/lib/firebase-operations"
import { clearVolunteerSession } from "@/lib/volunteer-session"
import { useToast } from "@/hooks/use-toast"
import type { Volunteer, Participant } from "@/lib/types"

interface QRScannerProps {
  volunteer: Volunteer
  onLogout: () => void
}

export function QRScanner({ volunteer, onLogout }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedParticipant, setScannedParticipant] = useState<Participant | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  const showConfetti = () => {
    // Simple confetti effect using CSS animation
    const confetti = document.createElement("div")
    confetti.innerHTML = "🎉".repeat(20)
    confetti.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      font-size: 2rem;
      animation: confetti-fall 3s ease-out forwards;
    `
    document.body.appendChild(confetti)

    // Add CSS animation if not already present
    if (!document.getElementById("confetti-styles")) {
      const style = document.createElement("style")
      style.id = "confetti-styles"
      style.textContent = `
        @keyframes confetti-fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
      `
      document.head.appendChild(style)
    }

    setTimeout(() => {
      document.body.removeChild(confetti)
    }, 3000)
  }

  const playSuccessSound = () => {
    // Create a simple success sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1)
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const processQRCode = async (qrData: string) => {
    setIsProcessing(true)
    setError(null)

    try {
      // Clean up QR data
      const cleanedQRData = qrData.trim()

      if (!cleanedQRData) {
        throw new Error("Invalid QR code format")
      }

      console.log("[v1] Processing QR Code data:", cleanedQRData)

      // Get participant from database using the QR data
      const participant = await getParticipantByQRData(cleanedQRData)
      if (!participant) {
        throw new Error("Participant not found. Please check the QR code.")
      }

      console.log("[v1] Found participant:", participant.id, participant.name)

      // Check if already checked in
      const alreadyCheckedIn = await isParticipantCheckedIn(participant.id)
      if (alreadyCheckedIn) {
        throw new Error("This participant has already been checked in.")
      }

      // Check in participant
      await checkInParticipant(participant.id, volunteer.id)

      // Success!
      setScannedParticipant(participant)
      showConfetti()
      playSuccessSound()

      toast({
        title: "Check-in Successful!",
        description: `${participant.name} has been checked in.`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to process QR code"
      setError(errorMessage)
      toast({
        title: "Check-in Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const startCamera = async () => {
    try {
      setIsScanning(true)
      setError(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        videoRef.current.onloadedmetadata = () => {
          setTimeout(captureFrame, 500) // Start scanning after camera is ready
        }
      }
    } catch (error) {
      setError("Failed to access camera. Please check permissions.")
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height)

    if (qrCode) {
      console.log("[v1] QR Code detected from camera:", qrCode.data)
      stopCamera()
      processQRCode(qrCode.data)
    } else {
      // Continue scanning
      setTimeout(captureFrame, 100)
    }
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")

        if (!context) {
          setError("Failed to process image")
          return
        }

        canvas.width = img.width
        canvas.height = img.height
        context.drawImage(img, 0, 0)

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height)

        if (qrCode) {
          console.log("[v1] QR Code detected from upload:", qrCode.data)
          processQRCode(qrCode.data)
        } else {
          setError("No QR code found in the uploaded image. Please try again with a clearer image.")
        }
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleLogout = () => {
    stopCamera()
    clearVolunteerSession()
    onLogout()
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  if (scannedParticipant) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="font-serif text-2xl text-primary">Check-in Successful!</CardTitle>
          <CardDescription>Participant has been verified and checked in</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h3 className="font-semibold">Participant Details:</h3>
            <p>
              <strong>Name:</strong> {scannedParticipant.name}
            </p>
            <p>
              <strong>College:</strong> {scannedParticipant.college}
            </p>
            <p>
              <strong>College ID:</strong> {scannedParticipant.collegeId}
            </p>
            <p>
              <strong>Email:</strong> {scannedParticipant.email}
            </p>
          </div>

          <Button
            onClick={() => {
              setScannedParticipant(null)
              setError(null)
            }}
            className="w-full"
            size="lg"
          >
            Scan Next Participant
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif text-2xl">QR Scanner</CardTitle>
              <CardDescription>Welcome, {volunteer.name}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isScanning ? (
            <div className="space-y-4">
              <div className="relative">
                <video ref={videoRef} className="w-full rounded-lg" autoPlay playsInline muted />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-primary border-dashed rounded-lg w-48 h-48 flex items-center justify-center">
                    <span className="text-primary font-medium bg-background/80 px-2 py-1 rounded">
                      {isProcessing ? "Processing..." : "Scanning for QR code..."}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={stopCamera} variant="outline" className="flex-1 bg-transparent">
                  Stop Camera
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Button onClick={startCamera} className="w-full" size="lg">
                <Camera className="h-4 w-4 mr-2" />
                Start Camera Scanner
              </Button>

              <div className="text-center text-sm text-muted-foreground">or</div>

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
                size="lg"
                disabled={isProcessing}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload QR Code Image
              </Button>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
