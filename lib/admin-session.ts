const ADMIN_SESSION_KEY = "admin_session"
const ADMIN_PIN = "2024" // In production, this should be environment variable
const SESSION_TIMEOUT = 4 * 60 * 60 * 1000 // 4 hours

interface AdminSession {
  isAuthenticated: boolean
  loginTime: number
}

export function authenticateAdmin(pin: string): boolean {
  return pin === ADMIN_PIN
}

export function saveAdminSession(): void {
  const session: AdminSession = {
    isAuthenticated: true,
    loginTime: Date.now(),
  }
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
}

export function getAdminSession(): boolean {
  try {
    const sessionData = localStorage.getItem(ADMIN_SESSION_KEY)
    if (!sessionData) return false

    const session: AdminSession = JSON.parse(sessionData)
    const now = Date.now()

    // Check if session has expired
    if (now - session.loginTime > SESSION_TIMEOUT) {
      clearAdminSession()
      return false
    }

    return session.isAuthenticated
  } catch {
    return false
  }
}

export function clearAdminSession(): void {
  localStorage.removeItem(ADMIN_SESSION_KEY)
}
