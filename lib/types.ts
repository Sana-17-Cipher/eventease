export interface Participant {
  id: string
  name: string
  email: string
  collegeId: string
  college: string
  phone: string
  qrCode: string
  registeredAt: Date
  checkedIn: boolean
  checkedInAt?: Date
  checkedOutAt?: Date
}

export interface Volunteer {
  id: string
  name: string
  email: string
  volunteerId: string
  registeredAt: Date
  lastLogin?: Date
}

export interface CheckInLog {
  id: string
  participantId: string
  volunteerId: string
  checkedInAt: Date
  checkedOutAt?: Date
}

export interface AdminSession {
  isAuthenticated: boolean
  loginTime?: Date
}
