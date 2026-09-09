// paymentService.jsx
// Handles the "Pay Registration Fee" flow. This module never renders a checkout
// form and never marks a payment as paid from the browser — that can only be
// done by a trusted administrator (or, in a future iteration, a verified
// payment-provider webhook processed server-side).
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../config/firebase.jsx'
import { findPaymentLinkForAmount, isValidHttpsUrl } from './paymentLinkService.jsx'
import { createAuditLogEntry } from './adminService.jsx'
import { FEE_STATUS } from '../config/constants.jsx'

export async function getApplicablePaymentLink(application) {
  if (!application || application.feeStatus !== FEE_STATUS.PAYMENT_REQUIRED) return null
  return findPaymentLinkForAmount(application.requestedAmount)
}

export async function getPaymentStatus(applicationId) {
  const snap = await getDoc(doc(db, 'applications', applicationId))
  if (!snap.exists()) return null
  return { feeStatus: snap.data().feeStatus, feeAmount: snap.data().feeAmount }
}

/**
 * Retrieves the applicable, admin-configured payment link for an application
 * and returns the URL to redirect to. Throws a user-safe error message (never
 * a raw Firebase error) if anything fails validation.
 */
export async function redirectToPayment(applicationId) {
  const user = auth.currentUser
  if (!user) throw new Error('You must be signed in to make a payment.')

  const appSnap = await getDoc(doc(db, 'applications', applicationId))
  if (!appSnap.exists()) throw new Error('Application not found.')
  const application = appSnap.data()

  if (application.userId !== user.uid) {
    throw new Error('You do not have permission to pay this application.')
  }
  if (application.feeStatus !== FEE_STATUS.PAYMENT_REQUIRED) {
    throw new Error('No payment is currently required for this application.')
  }

  const link = await findPaymentLinkForAmount(application.requestedAmount)
  if (!link || !link.enabled || !isValidHttpsUrl(link.url)) {
    throw new Error(
      'Online payment is currently unavailable. Please check again later or contact support.'
    )
  }

  await updateDoc(doc(db, 'applications', applicationId), {
    paymentLinkId: link.id,
    updatedAt: serverTimestamp(),
  })

  await createAuditLogEntry({
    actorId: user.uid,
    actorType: 'customer',
    action: 'payment_redirect_initiated',
    targetId: applicationId,
    details: { paymentLinkId: link.id },
  })

  window.location.href = link.url
}

/**
 * Admin-only. Marks a fee as verified/paid. Must be restricted server-side via
 * Firestore rules + custom claims so ordinary users can never call this
 * successfully on their own applications.
 */
export async function markPaymentVerified(applicationId, adminUid) {
  await updateDoc(doc(db, 'applications', applicationId), {
    feeStatus: FEE_STATUS.PAID,
    feeVerifiedAt: serverTimestamp(),
    feeVerifiedBy: adminUid,
    updatedAt: serverTimestamp(),
  })

  await createAuditLogEntry({
    actorId: adminUid,
    actorType: 'admin',
    action: 'payment_marked_verified',
    targetId: applicationId,
  })
}

export async function markPaymentRefunded(applicationId, adminUid) {
  await updateDoc(doc(db, 'applications', applicationId), {
    feeStatus: FEE_STATUS.REFUNDED,
    updatedAt: serverTimestamp(),
  })
  await createAuditLogEntry({
    actorId: adminUid,
    actorType: 'admin',
    action: 'payment_marked_refunded',
    targetId: applicationId,
  })
}

export async function waiveFee(applicationId, adminUid) {
  await updateDoc(doc(db, 'applications', applicationId), {
    feeStatus: FEE_STATUS.WAIVED,
    feeAmount: 0,
    updatedAt: serverTimestamp(),
  })
  await createAuditLogEntry({
    actorId: adminUid,
    actorType: 'admin',
    action: 'fee_waived',
    targetId: applicationId,
  })
}
