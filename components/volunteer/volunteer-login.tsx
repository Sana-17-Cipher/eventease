"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserCheck, AlertCircle } from "lucide-react"
import { authenticateVolunteer, addVolunteer } from "@/lib/firebase-operations"
import { saveVolunteerSession } from "@/lib/volunteer-session"
import { useToast } from "@/hooks/use-toast"
import type { Volunteer } from "@/lib/types"

interface VolunteerLoginProps {
  onLogin: (volunteer: Volunteer) => void
}

export function VolunteerLogin({ onLogin }: VolunteerLoginProps) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [volunteerId, setVolunteerId] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!email) {
        throw new Error("Please enter your email address")
      }

      const volunteer = await authenticateVolunteer(email)
      if (!volunteer) {
        throw new Error("Volunteer not found. Please register first or check your email.")
      }

      saveVolunteerSession(volunteer)
      onLogin(volunteer)

      // Option 1: Object-style toast (if your toast supports objects)
      toast({
        title: "Login Successful",
        description: `Welcome back, ${volunteer.name}!`,
      })
      
      // Option 2: String-style toast (uncomment this and comment above if your toast expects strings)
      // toast(`Login Successful: Welcome back, ${volunteer.name}!`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!email || !name || !volunteerId) {
        throw new Error("Please fill in all required fields")
      }

      // Check if volunteer already exists
      const existingVolunteer = await authenticateVolunteer(email)
      if (existingVolunteer) {
        throw new Error("A volunteer with this email already exists. Please login instead.")
      }

      const docId = await addVolunteer({
        name,
        email,
        volunteerId,
      })

      const newVolunteer: Volunteer = {
        id: docId,
        name,
        email,
        volunteerId,
        registeredAt: new Date(),
      }

      saveVolunteerSession(newVolunteer)
      onLogin(newVolunteer)

      // Option 1: Object-style toast (if your toast supports objects)
      toast({
        title: "Registration Successful",
        description: `Welcome to the team, ${name}!`,
      })
      
      // Option 2: String-style toast (uncomment this and comment above if your toast expects strings)
      // toast(`Registration Successful: Welcome to the team, ${name}!`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed. Please try again."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <UserCheck className="h-16 w-16 text-primary mx-auto mb-4" />
        <CardTitle className="font-serif text-2xl">{isLogin ? "Volunteer Login" : "Volunteer Registration"}</CardTitle>
        <CardDescription>
          {isLogin ? "Enter your email to access the QR scanner" : "Register as a new volunteer"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volunteerId">Volunteer ID *</Label>
                <Input
                  id="volunteerId"
                  type="text"
                  value={volunteerId}
                  onChange={(e) => setVolunteerId(e.target.value)}
                  placeholder="Enter your volunteer ID"
                  required
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          {error && (
            <Alert className="border-destructive bg-destructive/10 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isLogin ? "Logging in..." : "Registering..."}
              </>
            ) : (
              <>{isLogin ? "Login" : "Register"}</>
            )}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => {
              setIsLogin(!isLogin)
              setError(null)
              setEmail("")
              setName("")
              setVolunteerId("")
            }}
          >
            {isLogin ? "Need to register? Click here" : "Already registered? Login here"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}