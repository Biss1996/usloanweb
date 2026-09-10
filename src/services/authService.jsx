// authService.jsx — Firebase Authentication and user profile operations.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import { auth, db } from '../config/firebase.jsx'

/**
 * Registers a customer account.
 * Firebase Authentication securely handles the password.
 */
export async function registerUser({
  firstName,
  lastName,
  email,
  phone,
  state,
  password,
}) {
  const normalizedFirstName = firstName.trim()
  const normalizedLastName = lastName.trim()
  const normalizedEmail = email.trim().toLowerCase()

  const credential = await createUserWithEmailAndPassword(
    auth,
    normalizedEmail,
    password
  )

  const userDocument = {
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
    email: normalizedEmail,
    phone: phone.trim(),
    state,
    accountStatus: 'active',
    role: 'customer',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  // These operations are independent, so execute them concurrently.
  await Promise.all([
    updateProfile(credential.user, {
      displayName: `${normalizedFirstName} ${normalizedLastName}`,
    }),

    setDoc(
      doc(db, 'users', credential.user.uid),
      userDocument
    ),
  ])

  return credential.user
}

/**
 * Signs in an existing customer.
 */
export async function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase()

  const credential = await signInWithEmailAndPassword(
    auth,
    normalizedEmail,
    password
  )

  return credential.user
}

/**
 * Signs out the current user.
 */
export async function logoutUser() {
  await firebaseSignOut(auth)
}

/**
 * Sends a password-reset email.
 */
export async function requestPasswordReset(email) {
  const normalizedEmail = email.trim().toLowerCase()

  await sendPasswordResetEmail(auth, normalizedEmail)
}

/**
 * Gets the customer's Firestore profile.
 */
export async function getUserProfile(uid) {
  if (!uid) return null

  const snapshot = await getDoc(doc(db, 'users', uid))

  if (!snapshot.exists()) return null

  return {
    id: snapshot.id,
    ...snapshot.data(),
  }
}

/**
 * Reads the administrator custom claim from the current cached ID token.
 *
 * Set forceRefresh to true only immediately after an administrator's custom
 * claims have been changed on the server.
 */
export async function getIsAdmin(user, forceRefresh = false) {
  if (!user) return false

  const tokenResult = await user.getIdTokenResult(forceRefresh)

  return Boolean(tokenResult.claims?.admin)
}