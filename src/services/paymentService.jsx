// paymentService.jsx
//
// Handles registration-fee payment operations.
//
// Payment URLs must come from administrator-controlled Firestore documents.
// Payment verification must be performed through trusted server-side code,
// such as a verified payment-provider webhook.

import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'

import {
  auth,
  db,
} from '../config/firebase.jsx'

import {
  findPaymentLinkForAmount,
  isValidHttpsUrl,
} from './paymentLinkService.jsx'

import {
  createAuditLogEntry,
} from './adminService.jsx'

import {
  FEE_STATUS,
} from '../config/constants.jsx'

const APPLICATIONS_COLLECTION = 'applications'

function getApplicationReference(applicationId) {
  return doc(
    db,
    APPLICATIONS_COLLECTION,
    applicationId
  )
}

function validateApplicationId(applicationId) {
  if (
    !applicationId ||
    typeof applicationId !== 'string'
  ) {
    throw new Error(
      'A valid application ID is required.'
    )
  }
}

/**
 * Waits for Firebase to restore the current authentication session.
 */
async function getCurrentUser() {
  if (
    typeof auth.authStateReady === 'function'
  ) {
    await auth.authStateReady()
  }

  return auth.currentUser
}

/**
 * Converts Firebase errors into messages that are safe to show customers.
 */
function getPaymentError(error) {
  const messages = {
    'permission-denied':
      'You do not have permission to access this payment.',

    unauthenticated:
      'Your session has expired. Please sign in and try again.',

    unavailable:
      'The payment service is temporarily unavailable. Please try again shortly.',

    'deadline-exceeded':
      'The request took too long. Please check your connection and try again.',

    'failed-precondition':
      'Payment is not currently available for this application.',
  }

  return (
    messages[error?.code] ||
    error?.message ||
    'Unable to open payment. Please try again.'
  )
}

/**
 * Returns the payment link applicable to a loaded application.
 */
export async function getApplicablePaymentLink(
  application
) {
  if (
    !application ||
    application.feeStatus !==
      FEE_STATUS.PAYMENT_REQUIRED
  ) {
    return null
  }

  const requestedAmount = Number(
    application.requestedAmount
  )

  if (
    !Number.isFinite(requestedAmount) ||
    requestedAmount <= 0
  ) {
    return null
  }

  return findPaymentLinkForAmount(
    requestedAmount
  )
}

/**
 * Retrieves the current payment status.
 */
export async function getPaymentStatus(
  applicationId
) {
  validateApplicationId(applicationId)

  const snapshot = await getDoc(
    getApplicationReference(applicationId)
  )

  if (!snapshot.exists()) {
    return null
  }

  const data = snapshot.data()

  return {
    feeStatus: data.feeStatus,
    feeAmount: data.feeAmount,
    paymentLinkId:
      data.paymentLinkId || null,

    feeVerifiedAt:
      data.feeVerifiedAt || null,
  }
}

/**
 * Uses a loaded application when available to avoid an unnecessary Firestore
 * read. Passing only an ID remains supported.
 */
async function resolveApplication(
  applicationOrId
) {
  if (
    applicationOrId &&
    typeof applicationOrId === 'object'
  ) {
    const applicationId =
      applicationOrId.id ||
      applicationOrId.applicationId

    validateApplicationId(applicationId)

    return {
      ...applicationOrId,
      id: applicationId,
    }
  }

  validateApplicationId(applicationOrId)

  const snapshot = await getDoc(
    getApplicationReference(applicationOrId)
  )

  if (!snapshot.exists()) {
    throw new Error('Application not found.')
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  }
}

/**
 * Records payment redirection information without blocking the customer.
 *
 * These records are useful for diagnostics, but they are not proof of payment.
 * Payment status must only be updated from a verified provider webhook or
 * authorized administrator operation.
 */
function recordPaymentRedirect({
  application,
  paymentLink,
  user,
}) {
  const applicationReference =
    getApplicationReference(application.id)

  void Promise.allSettled([
    updateDoc(applicationReference, {
      paymentLinkId: paymentLink.id,
      paymentRedirectStartedAt:
        serverTimestamp(),

      updatedAt: serverTimestamp(),
    }),

    createAuditLogEntry({
      actorId: user.uid,
      actorType: 'customer',
      action: 'payment_redirect_initiated',
      targetId: application.id,

      details: {
        paymentLinkId: paymentLink.id,
      },
    }),
  ]).then((results) => {
    const [
      applicationUpdateResult,
      auditLogResult,
    ] = results

    if (
      applicationUpdateResult.status ===
      'rejected'
    ) {
      console.warn(
        'Payment tracking update failed:',
        applicationUpdateResult.reason
      )
    }

    if (auditLogResult.status === 'rejected') {
      console.warn(
        'Payment audit logging failed:',
        auditLogResult.reason
      )
    }
  })
}

/**
 * Validates the payment request and redirects the customer.
 *
 * Prefer passing the complete application already displayed:
 *
 *   await redirectToPayment(application)
 *
 * Passing an application ID is also supported:
 *
 *   await redirectToPayment(application.id)
 */
export async function redirectToPayment(
  applicationOrId
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error(
        'You must be signed in to make a payment.'
      )
    }

    const application =
      await resolveApplication(applicationOrId)

    if (application.userId !== user.uid) {
      throw new Error(
        'You do not have permission to pay this application.'
      )
    }

    if (
      application.feeStatus !==
      FEE_STATUS.PAYMENT_REQUIRED
    ) {
      throw new Error(
        'No payment is currently required for this application.'
      )
    }

    const requestedAmount = Number(
      application.requestedAmount
    )

    if (
      !Number.isFinite(requestedAmount) ||
      requestedAmount <= 0
    ) {
      throw new Error(
        'The application contains an invalid loan amount.'
      )
    }

    const paymentLink =
      await findPaymentLinkForAmount(
        requestedAmount
      )

    if (
      !paymentLink ||
      paymentLink.enabled !== true ||
      !isValidHttpsUrl(paymentLink.url)
    ) {
      throw new Error(
        'Online payment is currently unavailable. ' +
        'Please check again later or contact support.'
      )
    }

    /*
     * Start non-authoritative tracking, but do not wait for it.
     * A tracking permission error must not block a valid payment URL.
     */
    recordPaymentRedirect({
      application,
      paymentLink,
      user,
    })

    window.location.assign(paymentLink.url)
  } catch (error) {
    console.error(
      'PAYMENT REDIRECT ERROR:',
      error?.code,
      error?.message,
      error
    )

    throw new Error(
      getPaymentError(error)
    )
  }
}

/**
 * Performs an administrator payment-status update and audit operation.
 */
async function updateFeeStatus({
  applicationId,
  adminUid,
  update,
  auditAction,
}) {
  validateApplicationId(applicationId)

  if (
    !adminUid ||
    typeof adminUid !== 'string'
  ) {
    throw new Error(
      'A valid administrator ID is required.'
    )
  }

  const applicationReference =
    getApplicationReference(applicationId)

  // The authoritative status change must succeed first.
  await updateDoc(applicationReference, {
    ...update,
    updatedAt: serverTimestamp(),
  })

  // Keep administrator audit failures visible.
  await createAuditLogEntry({
    actorId: adminUid,
    actorType: 'admin',
    action: auditAction,
    targetId: applicationId,
  })
}

/**
 * Administrator only.
 */
export async function markPaymentVerified(
  applicationId,
  adminUid
) {
  return updateFeeStatus({
    applicationId,
    adminUid,

    update: {
      feeStatus: FEE_STATUS.PAID,
      feeVerifiedAt: serverTimestamp(),
      feeVerifiedBy: adminUid,
    },

    auditAction: 'payment_marked_verified',
  })
}

/**
 * Administrator only.
 */
export async function markPaymentRefunded(
  applicationId,
  adminUid
) {
  return updateFeeStatus({
    applicationId,
    adminUid,

    update: {
      feeStatus: FEE_STATUS.REFUNDED,
      feeRefundedAt: serverTimestamp(),
      feeRefundedBy: adminUid,
    },

    auditAction: 'payment_marked_refunded',
  })
}

/**
 * Administrator only.
 */
export async function waiveFee(
  applicationId,
  adminUid
) {
  return updateFeeStatus({
    applicationId,
    adminUid,

    update: {
      feeStatus: FEE_STATUS.WAIVED,
      feeAmount: 0,
      feeWaivedAt: serverTimestamp(),
      feeWaivedBy: adminUid,
    },

    auditAction: 'fee_waived',
  })
}