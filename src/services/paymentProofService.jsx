import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase.jsx'
import { supabase } from '../config/supabase.jsx'

const MAX_SIZE = 5 * 1024 * 1024
const EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
}

async function ensureSupabaseRole(user) {
  const token = await user.getIdToken()

  const response = await fetch('/api/ensure-supabase-role', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Could not authorize your upload. Please try again.')
  }

  // Pick up the claim that the Vercel endpoint just assigned.
  await user.getIdToken(true)
}

export async function uploadPaymentProof(application, file) {
  if (typeof auth.authStateReady === 'function') {
    await auth.authStateReady()
  }

  const user = auth.currentUser

  if (!user || application?.userId !== user.uid) {
    throw new Error('Sign in as the applicant to upload a receipt.')
  }

  if (!application.id) {
    throw new Error('Application ID is missing.')
  }

  if (!file || !EXTENSIONS[file.type]) {
    throw new Error('Select a JPG, PNG, or PDF receipt.')
  }

  if (file.size > MAX_SIZE) {
    throw new Error('The receipt must be smaller than 5 MB.')
  }

  await ensureSupabaseRole(user)

  const path =
    `${user.uid}/${application.id}/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`

  const { error } = await supabase.storage
    .from('payment-proofs')
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    throw new Error(`Receipt upload failed: ${error.message}`)
  }

  await updateDoc(doc(db, 'applications', application.id), {
    paymentProofPath: path,
    paymentProofProvider: 'supabase',
    paymentProofStatus: 'pending_review',
    paymentProofUploadedAt: serverTimestamp(),
  })

  return path
}