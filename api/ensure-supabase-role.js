import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

function adminAuth() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  }

  return getAuth()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (!token) {
    return res.status(401).json({ error: 'Sign in required' })
  }

  try {
    const firebaseAuth = adminAuth()
    const decoded = await firebaseAuth.verifyIdToken(token, true)
    const user = await firebaseAuth.getUser(decoded.uid)

    if (user.customClaims?.role !== 'authenticated') {
      await firebaseAuth.setCustomUserClaims(user.uid, {
        ...(user.customClaims || {}),
        role: 'authenticated',
      })
    }

    return res.status(200).json({ ready: true })
  } catch (error) {
    console.error('Firebase claim setup failed:', error)
    return res.status(500).json({ error: 'Unable to prepare upload' })
  }
}