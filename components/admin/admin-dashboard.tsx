"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  UserCheck,
  Download,
  LogOut,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react"
import { getAllParticipants, getAllVolunteers, getAllCheckIns, subscribeToLiveStats } from "@/lib/firebase-operations"
import { exportParticipantsToExcel, exportVolunteersToExcel } from "@/lib/excel-export"
import { clearAdminSession } from "@/lib/admin-session"
import { useToast } from "@/hooks/use-toast"

interface AdminDashboardProps {
  onLogout: () => void
}

interface DashboardStats {
  totalRegistrations: number
  totalCheckedIn: number
  recentCheckIns: any[]
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistrations: 0,
    totalCheckedIn: 0,
    recentCheckIns: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = subscribeToLiveStats((newStats) => {
      setStats(newStats)
      setLastUpdate(new Date())
      setIsLoading(false)
      setIsConnected(true)
      setError(null)
    })

    // Handle connection errors
    const handleError = (error: any) => {
      console.error("Real-time connection error:", error)
      setIsConnected(false)
      setError("Connection lost. Attempting to reconnect...")
    }

    // Set up error handling
    window.addEventListener("online", () => setIsConnected(true))
    window.addEventListener("offline", () => setIsConnected(false))

    return () => {
      unsubscribe()
      window.removeEventListener("online", () => setIsConnected(true))
      window.removeEventListener("offline", () => setIsConnected(false))
    }
  }, [])

  useEffect(() => {
    if (stats.recentCheckIns.length > 0 && !isLoading) {
      const latestCheckIn = stats.recentCheckIns[0]
      // Support either `timestamp` or `checkedInAt`
      const checkInTime =
        latestCheckIn?.timestamp?.toDate?.() ??
        latestCheckIn?.checkedInAt?.toDate?.()

      // Only show notification for very recent check-ins (within last 10 seconds)
      if (checkInTime && Date.now() - checkInTime.getTime() < 10000) {
        toast({
          title: "New Check-in!",
          description: `Participant ${latestCheckIn.participantId} just checked in`,
          duration: 3000,
        })
      }
    }
  }, [stats.recentCheckIns, isLoading, toast])

  const handleExportParticipants = async () => {
    try {
      const [participants, checkIns] = await Promise.all([getAllParticipants(), getAllCheckIns()])

      exportParticipantsToExcel(participants, checkIns)

      toast({
        title: "Export Successful",
        description: "Participants data has been exported to Excel.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export participants data.",
        variant: "destructive",
      })
    }
  }

  const handleExportVolunteers = async () => {
    try {
      const volunteers = await getAllVolunteers()
      exportVolunteersToExcel(volunteers)

      toast({
        title: "Export Successful",
        description: "Volunteers data has been exported to Excel.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export volunteers data.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    clearAdminSession()
    onLogout()
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Connecting to real-time data...</p>
        </div>
      </div>
    )
  }

  const checkInRate =
    stats.totalRegistrations > 0 ? Math.round((stats.totalCheckedIn / stats.totalRegistrations) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold font-serif">Admin Dashboard</h1>
            <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center space-x-1">
              {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span>{isConnected ? "Live" : "Offline"}</span>
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Real-time event analytics • Last update: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">Participants registered for the event</p>
            {isConnected && (
              <div className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full animate-pulse"></div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCheckedIn}</div>
            <p className="text-xs text-muted-foreground">Participants currently at the event</p>
            {isConnected && (
              <div className="absolute top-2 right-2 h-2 w-2 bg-secondary rounded-full animate-pulse"></div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-in Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkInRate}%</div>
            <p className="text-xs text-muted-foreground">Percentage of registered participants</p>
            {isConnected && <div className="absolute top-2 right-2 h-2 w-2 bg-accent rounded-full animate-pulse"></div>}
          </CardContent>
        </Card>
      </div>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Data Export</CardTitle>
          <CardDescription>Download participant and volunteer data as Excel files</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleExportParticipants} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Participants
          </Button>
          <Button onClick={handleExportVolunteers} variant="outline" className="flex-1 bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Export Volunteers
          </Button>
        </CardContent>
      </Card>

      {/* Recent Check-ins */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif">Recent Check-ins</CardTitle>
              <CardDescription>Latest participant check-ins (live updates)</CardDescription>
            </div>
            {isConnected && stats.recentCheckIns.length > 0 && (
              <Badge variant="secondary" className="animate-pulse">
                Live
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {stats.recentCheckIns.length > 0 ? (
            <div className="space-y-3">
              {stats.recentCheckIns.slice(0, 5).map((checkIn, index) => (
                <div
                  key={checkIn.id || index}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                    index === 0 ? "bg-primary/10 border border-primary/20" : "bg-muted"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <UserCheck className={`h-4 w-4 ${index === 0 ? "text-primary" : "text-muted-foreground"}`} />
                    <div>
                      <p className="font-medium">Participant ID: {checkIn.participantId}</p>
                      <p className="text-sm text-muted-foreground">Volunteer: {checkIn.volunteerId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {(checkIn.timestamp?.toDate?.() ??
                        checkIn.checkedInAt?.toDate?.())?.toLocaleTimeString() || "Just now"}
                    </div>
                    {index === 0 && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        Latest
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2" />
              <p>No check-ins yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
