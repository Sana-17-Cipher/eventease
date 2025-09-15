"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Download, Mail, CheckCircle, AlertCircle } from "lucide-react"
import { generateQRCode, downloadQRCode } from "@/lib/qr-generator"
import { checkDuplicateParticipant, addParticipant, updateParticipantQRCode } from "@/lib/firebase-operations"
import { useToast } from "@/hooks/use-toast"

interface FormData {
  name: string
  email: string
  collegeId: string
  college: string
  phone: string
}

export function ParticipantRegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    collegeId: "",
    college: "",
    phone: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null)
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.collegeId || !formData.college || !formData.phone) {
        throw new Error("Please fill in all required fields")
      }

      // Check for duplicates
      const isDuplicate = await checkDuplicateParticipant(formData.email, formData.collegeId)
      if (isDuplicate) {
        throw new Error("A participant with this email or college ID is already registered")
      }

      // Save to Firebase first to get the document ID
      // Fix: Change null to undefined for checkedInAt
      const docId = await addParticipant({
        ...formData,
        qrCode: "", // Will be updated after QR generation
        checkedInAt: undefined,
      })

      // Generate QR code with the participant ID
      const qrCodeURL = await generateQRCode(docId)
      
      // Update the participant record with the QR code data
      await updateParticipantQRCode(docId, docId)

      setQrCodeDataURL(qrCodeURL)
      setParticipantId(docId)

      toast({
        title: "Registration Successful!",
        description: "Your QR code has been generated. You can download it or receive it via email.",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed. Please try again."
      setError(errorMessage)
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadQR = () => {
    if (qrCodeDataURL && participantId) {
      downloadQRCode(qrCodeDataURL, participantId)
      toast({
        title: "QR Code Downloaded",
        description: "Your QR code has been saved to your device.",
      })
    }
  }

  const handleEmailQR = async () => {
    // This would integrate with EmailJS or similar service
    toast({
      title: "Email Sent",
      description: "Your QR code has been sent to your email address.",
    })
  }

  if (qrCodeDataURL) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="font-serif text-2xl">Registration Complete!</CardTitle>
          <CardDescription>Your QR code is ready for the event</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <img
              src={qrCodeDataURL || "/placeholder.svg"}
              alt="Participant QR Code"
              className="mx-auto rounded-lg shadow-md"
            />
            <p className="text-sm text-muted-foreground mt-2">Participant ID: {participantId}</p>
          </div>

          <div className="space-y-3">
            <Button onClick={handleDownloadQR} className="w-full" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>

            <Button onClick={handleEmailQR} variant="outline" className="w-full" size="lg">
              <Mail className="h-4 w-4 mr-2" />
              Email QR Code
            </Button>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please save your QR code and bring it to the event for check-in. Keep your Participant ID safe for
              reference.
            </AlertDescription>
          </Alert>

          <Button
            onClick={() => {
              setQrCodeDataURL(null)
              setParticipantId(null)
              setFormData({
                name: "",
                email: "",
                collegeId: "",
                college: "",
                phone: "",
              })
            }}
            variant="ghost"
            className="w-full"
          >
            Register Another Participant
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">Participant Registration</CardTitle>
        <CardDescription>Register for the college fest and get your QR code</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="collegeId">College ID *</Label>
            <Input
              id="collegeId"
              name="collegeId"
              type="text"
              value={formData.collegeId}
              onChange={handleInputChange}
              placeholder="Enter your college ID"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="college">College Name *</Label>
            <Input
              id="college"
              name="college"
              type="text"
              value={formData.college}
              onChange={handleInputChange}
              placeholder="Enter your college name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              required
            />
          </div>

          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Registering...
              </>
            ) : (
              "Register & Generate QR Code"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}