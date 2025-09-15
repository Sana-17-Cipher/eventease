// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
]

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

let app: any = null
let db: any = null
let storage: any = null
let isFirebaseConfigured = false

if (missingVars.length > 0) {
  console.warn("[v0] Firebase not configured - running in demo mode:", missingVars)
} else {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
  }

  try {
    // ✅ Prevent multiple inits
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

    // ✅ Database
    db = getFirestore(app)

    // ✅ Storage
    storage = getStorage(app)

    isFirebaseConfigured = true
    console.log("[v0] Firebase initialized successfully")
  } catch (error) {
    console.error("[v0] Firebase initialization failed:", error)
  }
}

// ✅ Export Firestore (Database), Storage, and config status
export { db, storage, isFirebaseConfigured }
