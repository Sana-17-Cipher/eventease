import type { Volunteer } from "./types"

const VOLUNTEER_SESSION_KEY = "volunteer_session"
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000 // 2 hours

interface VolunteerSession {
  volunteer: Volunteer
  loginTime: number
}

export function saveVolunteerSession(volunteer: Volunteer): void {
  const session: VolunteerSession = {
    volunteer,
    loginTime: Date.now(),
  }
  localStorage.setItem(VOLUNTEER_SESSION_KEY, JSON.stringify(session))
}

export function getVolunteerSession(): Volunteer | null {
  try {
    const sessionData = localStorage.getItem(VOLUNTEER_SESSION_KEY)
    if (!sessionData) return null

    const session: VolunteerSession = JSON.parse(sessionData)
    const now = Date.now()

    // Check if session has expired
    if (now - session.loginTime > SESSION_TIMEOUT) {
      clearVolunteerSession()
      return null
    }

    return session.volunteer
  } catch {
    return null
  }
}

export function clearVolunteerSession(): void {
  localStorage.removeItem(VOLUNTEER_SESSION_KEY)
}
