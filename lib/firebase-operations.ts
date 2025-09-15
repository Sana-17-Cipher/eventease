import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  onSnapshot,
  orderBy,
  limit,
  doc,
  updateDoc
} from "firebase/firestore"
import { db, isFirebaseConfigured } from "./firebase"
import type { Participant, Volunteer } from "./types"

const demoParticipants: Participant[] = [
  {
    id: "demo-1",
    name: "John Doe",
    email: "john@example.com",
    collegeId: "CS001",
    college: "Demo University",
    phone: "+1234567890",
    qrCode: "demo-qr-1",
    registeredAt: new Date(),
    checkedIn: false,
  },
  {
    id: "demo-2",
    name: "Jane Smith",
    email: "jane@example.com",
    collegeId: "CS002",
    college: "Demo College",
    phone: "+1234567891",
    qrCode: "demo-qr-2",
    registeredAt: new Date(),
    checkedIn: false,
  },
]

const demoVolunteers: Volunteer[] = [
  {
    id: "vol-1",
    name: "Alice Johnson",
    email: "alice@volunteer.com",
    volunteerId: "vol-1",
    registeredAt: new Date(),
  },
]

const demoCheckIns = [
  {
    id: "checkin-1",
    participantId: "demo-1",
    volunteerId: "vol-1",
    checkedInAt: { seconds: Date.now() / 1000 },
    type: "check-in",
  },
]

const demoCheckOuts = [
  {
    id: "checkout-1",
    participantId: "demo-1",
    volunteerId: "vol-1",
    checkedOutAt: { seconds: Date.now() / 1000 },
    type: "check-out",
  },
]

export async function checkDuplicateParticipant(email: string, collegeId: string): Promise<boolean> {
  if (!isFirebaseConfigured) {
    return demoParticipants.some((p) => p.email === email || p.collegeId === collegeId)
  }

  const participantsRef = collection(db, "participants")
  const emailQuery = query(participantsRef, where("email", "==", email))
  const collegeIdQuery = query(participantsRef, where("collegeId", "==", collegeId))

  const [emailSnapshot, collegeIdSnapshot] = await Promise.all([getDocs(emailQuery), getDocs(collegeIdQuery)])

  return !emailSnapshot.empty || !collegeIdSnapshot.empty
}

export async function addParticipant(participantData: Omit<Participant, "id" | "registeredAt" | "checkedIn">): Promise<string> {
  if (!isFirebaseConfigured) {
    const newId = `demo-${Date.now()}`
    demoParticipants.push({
      ...participantData,
      id: newId,
      registeredAt: new Date(),
      checkedIn: false,
    })
    return newId
  }

  const participantsRef = collection(db, "participants")
  const docRef = await addDoc(participantsRef, {
    ...participantData,
    registeredAt: serverTimestamp(),
    checkedIn: false,
  })
  return docRef.id
}

export async function updateParticipantQRCode(participantId: string, qrCodeData: string): Promise<void> {
  if (!isFirebaseConfigured) {
    // Update the QR code in the demo data
    const participant = demoParticipants.find(p => p.id === participantId)
    if (participant) {
      participant.qrCode = qrCodeData
    }
    return
  }

  // Update the participant record in Firestore with the QR code data
  const participantRef = doc(db, "participants", participantId)
  await updateDoc(participantRef, {
    qrCode: qrCodeData
  })
}

export async function addVolunteer(volunteerData: Omit<Volunteer, "id" | "registeredAt">): Promise<string> {
  if (!isFirebaseConfigured) {
    const newId = `vol-${Date.now()}`
    demoVolunteers.push({
      ...volunteerData,
      id: newId,
      registeredAt: new Date(),
    })
    return newId
  }

  const volunteersRef = collection(db, "volunteers")
  const docRef = await addDoc(volunteersRef, {
    ...volunteerData,
    registeredAt: serverTimestamp(),
  })
  return docRef.id
}

export async function authenticateVolunteer(email: string): Promise<Volunteer | null> {
  if (!isFirebaseConfigured) {
    return demoVolunteers.find((v) => v.email === email) || null
  }

  const volunteersRef = collection(db, "volunteers")
  const q = query(volunteersRef, where("email", "==", email))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    return null
  }

  const doc = snapshot.docs[0]
  return { id: doc.id, ...doc.data() } as Volunteer
}

export async function getParticipantByQRData(qrData: string): Promise<Participant | null> {
  if (!isFirebaseConfigured) {
    // First try direct match with participant ID (most common case)
    const directMatch = demoParticipants.find((p) => p.id === qrData)
    if (directMatch) return directMatch

    // Try matching against qrCode field directly
    const qrMatch = demoParticipants.find((p) => p.qrCode === qrData)
    if (qrMatch) return qrMatch

    // Try parsing the QR data if it's JSON
    try {
      const parsedData = JSON.parse(qrData)
      return demoParticipants.find((p) => p.id === parsedData.id) || null
    } catch {
      // Not JSON format, no more matching to try
      return null
    }
  }

  const participantsRef = collection(db, "participants")
  
  // First try direct match with participant ID (most common case)
  let q = query(participantsRef, where("id", "==", qrData))
  let snapshot = await getDocs(q)
  
  if (snapshot.empty) {
    // Try matching against qrCode field
    q = query(participantsRef, where("qrCode", "==", qrData))
    snapshot = await getDocs(q)
  }

  if (snapshot.empty) {
    // Try parsing QR data and searching by ID if it's in JSON format
    try {
      const parsedData = JSON.parse(qrData)
      if (parsedData.id) {
        q = query(participantsRef, where("id", "==", parsedData.id))
        snapshot = await getDocs(q)
      }
    } catch {
      // QR data is not JSON, no more matching to try
    }
  }

  if (snapshot.empty) {
    // As a last resort, try getting the document directly by ID
    try {
      const docRef = doc(db, "participants", qrData)
      const docSnapshot = await getDocs(query(collection(db, "participants"), where("__name__", "==", qrData)))
      if (!docSnapshot.empty) {
        const doc = docSnapshot.docs[0]
        return { id: doc.id, ...doc.data() } as Participant
      }
    } catch {
      // Final attempt failed
    }
    return null
  }

  const docData = snapshot.docs[0]
  return { id: docData.id, ...docData.data() } as Participant
}

export async function checkInParticipant(participantId: string, volunteerId: string): Promise<void> {
  if (!isFirebaseConfigured) {
    // Update participant's checked-in status
    const participant = demoParticipants.find(p => p.id === participantId)
    if (participant) {
      participant.checkedIn = true
    }
    
    demoCheckIns.push({
      id: `checkin-${Date.now()}`,
      participantId,
      volunteerId,
      checkedInAt: { seconds: Date.now() / 1000 },
      type: "check-in",
    })
    return
  }

  const checkInsRef = collection(db, "checkIns")
  await addDoc(checkInsRef, {
    participantId,
    volunteerId,
    checkedInAt: serverTimestamp(),
    type: "check-in",
  })

  // Update participant's checked-in status in Firebase would require additional query
  // For now, we'll handle this in the client or create a cloud function
}

export async function checkOutParticipant(participantId: string, volunteerId: string): Promise<void> {
  if (!isFirebaseConfigured) {
    // Update participant's checked-in status
    const participant = demoParticipants.find(p => p.id === participantId)
    if (participant) {
      participant.checkedIn = false
    }

    demoCheckOuts.push({
      id: `checkout-${Date.now()}`,
      participantId,
      volunteerId,
      checkedOutAt: { seconds: Date.now() / 1000 },
      type: "check-out",
    })
    return
  }

  const checkInsRef = collection(db, "checkIns")
  await addDoc(checkInsRef, {
    participantId,
    volunteerId,
    checkedOutAt: serverTimestamp(),
    type: "check-out",
  })
}

export async function isParticipantCheckedIn(participantId: string): Promise<boolean> {
  if (!isFirebaseConfigured) {
    const participant = demoParticipants.find(p => p.id === participantId)
    return participant?.checkedIn || false
  }

  const checkInsRef = collection(db, "checkIns")
  
  // Get the most recent check-in or check-out for this participant
  const q = query(
    checkInsRef, 
    where("participantId", "==", participantId),
    orderBy("checkedInAt", "desc"),
    orderBy("checkedOutAt", "desc"),
    limit(1)
  )
  
  const snapshot = await getDocs(q)
  
  if (snapshot.empty) {
    return false
  }

  const latestRecord = snapshot.docs[0].data()
  return latestRecord.type === "check-in"
}

export async function getAllParticipants(): Promise<Participant[]> {
  if (!isFirebaseConfigured) {
    return [...demoParticipants]
  }

  const participantsRef = collection(db, "participants")
  const snapshot = await getDocs(participantsRef)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Participant[]
}

export async function getAllVolunteers(): Promise<Volunteer[]> {
  if (!isFirebaseConfigured) {
    return [...demoVolunteers]
  }

  const volunteersRef = collection(db, "volunteers")
  const snapshot = await getDocs(volunteersRef)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Volunteer[]
}

export async function getAllCheckIns(): Promise<any[]> {
  if (!isFirebaseConfigured) {
    return [...demoCheckIns, ...demoCheckOuts]
  }

  const checkInsRef = collection(db, "checkIns")
  const snapshot = await getDocs(checkInsRef)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

export async function getParticipantStats(): Promise<{
  totalRegistrations: number
  totalCheckedIn: number
  recentCheckIns: any[]
}> {
  if (!isFirebaseConfigured) {
    const checkedInParticipants = demoParticipants.filter(p => p.checkedIn)

    return {
      totalRegistrations: demoParticipants.length,
      totalCheckedIn: checkedInParticipants.length,
      recentCheckIns: demoCheckIns.slice(0, 10),
    }
  }

  const [participants, checkIns] = await Promise.all([getAllParticipants(), getAllCheckIns()])

  const checkedInParticipants = new Set(
    checkIns.filter((checkIn) => checkIn.type === "check-in").map((checkIn) => checkIn.participantId),
  )

  const recentCheckIns = checkIns
    .filter((checkIn) => checkIn.type === "check-in")
    .sort((a, b) => b.checkedInAt?.seconds - a.checkedInAt?.seconds)
    .slice(0, 10)

  return {
    totalRegistrations: participants.length,
    totalCheckedIn: checkedInParticipants.size,
    recentCheckIns,
  }
}

export function subscribeToParticipants(callback: (participants: Participant[]) => void) {
  if (!isFirebaseConfigured) {
    callback([...demoParticipants])
    return () => {} // Return empty unsubscribe function
  }

  const participantsRef = collection(db, "participants")
  const q = query(participantsRef, orderBy("registeredAt", "desc"))

  return onSnapshot(q, (snapshot) => {
    const participants = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Participant[]
    callback(participants)
  })
}

export function subscribeToCheckIns(callback: (checkIns: any[]) => void) {
  if (!isFirebaseConfigured) {
    callback([...demoCheckIns, ...demoCheckOuts])
    return () => {} // Return empty unsubscribe function
  }

  const checkInsRef = collection(db, "checkIns")
  const q = query(checkInsRef, orderBy("checkedInAt", "desc"), limit(50))

  return onSnapshot(q, (snapshot) => {
    const checkIns = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    callback(checkIns)
  })
}

export function subscribeToVolunteers(callback: (volunteers: Volunteer[]) => void) {
  if (!isFirebaseConfigured) {
    callback([...demoVolunteers])
    return () => {} // Return empty unsubscribe function
  }

  const volunteersRef = collection(db, "volunteers")
  const q = query(volunteersRef, orderBy("registeredAt", "desc"))

  return onSnapshot(q, (snapshot) => {
    const volunteers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Volunteer[]
    callback(volunteers)
  })
}

export function subscribeToRecentCheckIns(callback: (checkIns: any[]) => void) {
  if (!isFirebaseConfigured) {
    callback([...demoCheckIns])
    return () => {} // Return empty unsubscribe function
  }

  const checkInsRef = collection(db, "checkIns")
  const q = query(checkInsRef, where("type", "==", "check-in"), orderBy("checkedInAt", "desc"), limit(10))

  return onSnapshot(q, (snapshot) => {
    const checkIns = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    callback(checkIns)
  })
}

export function subscribeToLiveStats(
  callback: (stats: {
    totalRegistrations: number
    totalCheckedIn: number
    recentCheckIns: any[]
  }) => void,
) {
  if (!isFirebaseConfigured) {
    const checkedInParticipants = demoParticipants.filter(p => p.checkedIn)

    callback({
      totalRegistrations: demoParticipants.length,
      totalCheckedIn: checkedInParticipants.length,
      recentCheckIns: demoCheckIns.slice(0, 10),
    })

    return () => {} // Return empty unsubscribe function
  }

  let participants: Participant[] = []
  let checkIns: any[] = []
  let recentCheckIns: any[] = []

  const updateStats = () => {
    const checkedInParticipants = new Set(
      checkIns.filter((checkIn) => checkIn.type === "check-in").map((checkIn) => checkIn.participantId),
    )

    callback({
      totalRegistrations: participants.length,
      totalCheckedIn: checkedInParticipants.size,
      recentCheckIns: recentCheckIns,
    })
  }

  const unsubscribeParticipants = subscribeToParticipants((newParticipants) => {
    participants = newParticipants
    updateStats()
  })

  const unsubscribeCheckIns = subscribeToCheckIns((newCheckIns) => {
    checkIns = newCheckIns
    updateStats()
  })

  const unsubscribeRecentCheckIns = subscribeToRecentCheckIns((newRecentCheckIns) => {
    recentCheckIns = newRecentCheckIns
    updateStats()
  })

  // Return cleanup function
  return () => {
    unsubscribeParticipants()
    unsubscribeCheckIns()
    unsubscribeRecentCheckIns()
  }
}