// firebase.jsx
// Central Firebase initialization. Never hardcode production credentials here —
// all values are read from Vite environment variables (see .env.example).
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const missing = Object.entries(firebaseConfig).filter(([, v]) => !v)
if (missing.length) {
  // eslint-disable-next-line no-console
  console.warn(
    '[firebase.jsx] Missing environment variables:',
    missing.map(([k]) => k).join(', '),
    '\nCopy .env.example to .env and fill in your Firebase project values.'
  )
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Persistent local cache: repeat reads of unchanged data are served instantly
// from IndexedDB instead of round-tripping to Firestore every time, which
// matters a lot when the database region is far from the visitor. Falls back
// gracefully (in-memory only) in browsers/tabs where IndexedDB isn't available.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})

export default app