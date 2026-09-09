// authService.jsx — all Firebase Authentication + user profile logic lives here.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../config/firebase.jsx'

/**
 * Register a new customer account.
 * Never stores plaintext passwords — Firebase Authentication handles credential hashing.
 */
export async function registerUser({ firstName, lastName, email, phone, state, password }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName: `${firstName} ${lastName}` })

  await setDoc(doc(db, 'users', cred.user.uid), {
    firstName,
    lastName,
    email,
    phone,
    state,
    accountStatus: 'active',
    role: 'customer',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return cred.user
}

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function logoutUser() {
  return fbSignOut(auth)
}

export async function requestPasswordReset(email) {
  return sendPasswordResetEmail(auth, email)
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

/**
 * Refreshes the Firebase ID token and reads custom claims to determine admin status.
 * Admin status is granted via Firebase Admin SDK custom claims (see README), never
 * via a client-writable Firestore field.
 */
export async function getIsAdmin(user) {
  if (!user) return false
  const tokenResult = await user.getIdTokenResult(true)
  return Boolean(tokenResult.claims?.admin)
}
