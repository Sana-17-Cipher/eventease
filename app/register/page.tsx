import { ParticipantRegistrationForm } from "@/components/forms/participant-registration-form"

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold font-serif">Participant Registration</h1>
        <p className="text-muted-foreground">
          Join the college fest! Fill out the form below to register and receive your unique QR code.
        </p>
      </div>

      <ParticipantRegistrationForm />
    </div>
  )
}
