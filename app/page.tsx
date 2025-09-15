import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, QrCode, BarChart3, Calendar, CheckCircle, Shield } from "lucide-react"

export default function HomePage() {
  const roles = [
    {
      title: "Participant",
      description: "Register for events and get your QR code",
      icon: Users,
      href: "/register",
      features: ["Quick registration", "QR code generation", "Email confirmation"],
      color: "bg-primary",
    },
    {
      title: "Volunteer",
      description: "Scan QR codes and manage check-ins",
      icon: QrCode,
      href: "/volunteer",
      features: ["QR code scanning", "Real-time check-ins", "Participant verification"],
      color: "bg-secondary",
    },
    {
      title: "Admin",
      description: "Monitor events and view analytics",
      icon: BarChart3,
      href: "/admin",
      features: ["Real-time dashboard", "Export data", "Event analytics"],
      color: "bg-accent",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-serif text-foreground">Welcome to EventEase</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Streamline your college fest management with our modern, intuitive platform. Register participants, manage
          check-ins, and track analytics in real-time.
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Easy Registration</h3>
            <p className="text-sm text-muted-foreground">
              Quick and simple participant registration with instant QR code generation
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-secondary" />
            <h3 className="font-semibold mb-2">Smart Check-ins</h3>
            <p className="text-sm text-muted-foreground">
              Seamless QR code scanning with real-time validation and duplicate prevention
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <Shield className="h-12 w-12 mx-auto mb-4 text-accent" />
            <h3 className="font-semibold mb-2">Secure Analytics</h3>
            <p className="text-sm text-muted-foreground">
              PIN-protected admin dashboard with comprehensive event insights
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role Selection */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-serif text-center">Choose Your Role</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon

            return (
              <Card key={role.title} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 rounded-full ${role.color} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="font-serif">{role.title}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link href={role.href} className="w-full">
                    <Button className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
