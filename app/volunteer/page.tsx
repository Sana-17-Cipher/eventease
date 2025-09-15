"use client"

import { useState, useEffect } from "react"
import { VolunteerLogin } from "@/components/volunteer/volunteer-login"
import { QRScanner } from "@/components/volunteer/qr-scanner"
import { getVolunteerSession } from "@/lib/volunteer-session"
import type { Volunteer } from "@/lib/types"

export default function VolunteerPage() {
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const existingSession = getVolunteerSession()
    if (existingSession) {
      setVolunteer(existingSession)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (loggedInVolunteer: Volunteer) => {
    setVolunteer(loggedInVolunteer)
  }

  const handleLogout = () => {
    setVolunteer(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold font-serif">Volunteer Portal</h1>
        <p className="text-muted-foreground">
          {volunteer ? "Scan participant QR codes to manage check-ins" : "Login to access the QR scanner"}
        </p>
      </div>

      {volunteer ? (
        <QRScanner volunteer={volunteer} onLogout={handleLogout} />
      ) : (
        <VolunteerLogin onLogin={handleLogin} />
      )}
    </div>
  )
}
