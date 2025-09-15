"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Loader2, AlertCircle } from "lucide-react"
import { authenticateAdmin, saveAdminSession } from "@/lib/admin-session"
import { useToast } from "@/hooks/use-toast"

interface AdminLoginProps {
  onLogin: () => void
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [pin, setPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!pin) {
        throw new Error("Please enter the admin PIN")
      }

      const isValid = authenticateAdmin(pin)
      if (!isValid) {
        throw new Error("Invalid PIN. Please try again.")
      }

      saveAdminSession()
      onLogin()

      // Option 1: Object-style toast (if your toast supports objects)
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard!",
      })
      
      // Option 2: String-style toast (uncomment this and comment above if your toast expects strings)
      // toast("Login Successful: Welcome to the admin dashboard!")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
        <CardTitle className="font-serif text-2xl">Admin Access</CardTitle>
        <CardDescription>Enter your PIN to access the admin dashboard</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin">Admin PIN</Label>
            <Input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value)
                setError(null)
              }}
              placeholder="Enter admin PIN"
              maxLength={10}
              className="text-center text-lg tracking-widest"
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
                Authenticating...
              </>
            ) : (
              "Access Dashboard"
            )}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Secure access for event administrators only</p>
        </div>
      </CardContent>
    </Card>
  )
}