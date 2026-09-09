// api/stripe-webhook.js
//
// Vercel Serverless Function — Stripe webhook handler.
// Deployed automatically alongside the frontend when you deploy this repo
// on Vercel (any file under /api becomes a route at /api/<filename>).
//
// This is the ONLY code path allowed to mark a registration fee as paid.
// It verifies the request genuinely came from Stripe (via the webhook
// signing secret) and then writes to Firestore using the Firebase Admin
// SDK, which bypasses client security rules entirely — as it must, since a
// browser can never be trusted with "mark this paid" (see firestore.rules).
//
// Required Vercel environment variables (Project Settings -> Environment
// Variables — never commit these):
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET
//   FIREBASE_SERVICE_ACCOUNT_KEY   (the full JSON key, see README)

import Stripe from 'stripe'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

// Vercel must NOT parse the body for us — Stripe's signature check needs
// the exact raw bytes it signed, not a re-serialized JSON object.
export const config = {
  api: {
    bodyParser: false,
  },
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

// Reuse the Admin SDK connection across warm serverless invocations instead
// of reinitializing on every request.
function getDb() {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    initializeApp({ credential: cert(serviceAccount) })
  }
  return getFirestore()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed')
    return
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const signature = req.headers['stripe-signature']
  const rawBody = await readRawBody(req)

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    res.status(400).send(`Webhook Error: ${err.message}`)
    return
  }

  const db = getDb()

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      await handlePaymentSuccess(db, event.data.object)
    } else if (event.type === 'checkout.session.async_payment_failed') {
      await handlePaymentFailure(db, event.data.object)
    }
    res.status(200).json({ received: true })
  } catch (err) {
    console.error('Error handling Stripe event:', err)
    // 500 tells Stripe to retry the webhook later.
    res.status(500).send('Internal error')
  }
}

async function handlePaymentSuccess(db, session) {
  const applicationId = session.client_reference_id
  if (!applicationId) {
    console.warn('checkout.session.completed with no client_reference_id — cannot match to an application', session.id)
    return
  }

  const appRef = db.collection('applications').doc(applicationId)
  const snap = await appRef.get()
  if (!snap.exists) {
    console.warn('Stripe session referenced an application that does not exist:', applicationId)
    return
  }

  const application = snap.data()

  // Idempotency: Stripe may deliver the same event more than once.
  if (application.feeStatus === 'paid') {
    console.log('Application already marked paid, skipping:', applicationId)
    return
  }

  const timeline = application.timeline || []

  await appRef.update({
    feeStatus: 'paid',
    feeVerifiedAt: FieldValue.serverTimestamp(),
    feeVerifiedBy: 'stripe_webhook',
    updatedAt: FieldValue.serverTimestamp(),
    timeline: [
      ...timeline,
      {
        event: 'payment_auto_verified',
        at: new Date().toISOString(),
        note: `Verified automatically via Stripe (session ${session.id}).`,
      },
    ],
  })

  await db.collection('auditLogs').add({
    actorId: 'stripe_webhook',
    actorType: 'system',
    action: 'payment_marked_verified',
    targetId: applicationId,
    details: { stripeSessionId: session.id, source: 'webhook' },
    createdAt: FieldValue.serverTimestamp(),
  })

  await db.collection('users').doc(application.userId).collection('notifications').add({
    title: 'Payment verified',
    message: `Your registration fee payment for ${application.reference} has been verified.`,
    type: 'payment',
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  })
}

async function handlePaymentFailure(db, session) {
  const applicationId = session.client_reference_id
  if (!applicationId) return

  const appRef = db.collection('applications').doc(applicationId)
  const snap = await appRef.get()
  if (!snap.exists) return

  await appRef.update({
    feeStatus: 'failed',
    updatedAt: FieldValue.serverTimestamp(),
  })

  await db.collection('auditLogs').add({
    actorId: 'stripe_webhook',
    actorType: 'system',
    action: 'payment_marked_failed',
    targetId: applicationId,
    details: { stripeSessionId: session.id },
    createdAt: FieldValue.serverTimestamp(),
  })
}
