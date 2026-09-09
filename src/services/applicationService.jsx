// applicationService.jsx — loan application CRUD against Firestore.
import {
  addDoc, collection, doc, getDoc, getDocs, query, where, orderBy,
  serverTimestamp, updateDoc, onSnapshot,
} from 'firebase/firestore'
import { db } from '../config/firebase.jsx'
import { APPLICATION_STATUS, FEE_STATUS } from '../config/constants.jsx'
import { calculateRegistrationFee } from './settingsService.jsx'
import { createAuditLogEntry } from './adminService.jsx'
import { createNotification } from './notificationService.jsx'

function generateReference() {
  const year = new Date().getFullYear()
  const rand = Math.floor(100000 + Math.random() * 900000)
  return `QF-${year}-${rand}`
}

/**
 * Submits a completed application. The registration fee is calculated once, at
 * submission time, from the current loanConfig, and stored directly on the
 * application document so later configuration changes never retroactively alter it.
 */
export async function submitApplication({ userId, formData, loanConfig }) {
  const amount = Number(formData.loanAmount)
  const feeAmount = calculateRegistrationFee(amount, loanConfig)
  const feeStatus = feeAmount > 0 ? FEE_STATUS.PAYMENT_REQUIRED : FEE_STATUS.NOT_REQUIRED
  const reference = generateReference()

  const appRef = await addDoc(collection(db, 'applications'), {
    userId,
    reference,
    requestedAmount: amount,
    loanPurpose: formData.loanPurpose || '',
    loanTerm: formData.loanTerm || loanConfig.minimumTerm,
    applicant: {
      firstName: formData.firstName,
      middleName: formData.middleName || '',
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      phone: formData.phone,
      email: formData.email,
    },
    address: {
      street: formData.street,
      apartment: formData.apartment || '',
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      residenceType: formData.residenceType,
      timeAtAddress: formData.timeAtAddress,
    },
    employment: {
      status: formData.employmentStatus,
      employerName: formData.employerName || '',
      jobTitle: formData.jobTitle || '',
      monthlyIncome: Number(formData.monthlyIncome) || 0,
      duration: formData.employmentDuration || '',
      payFrequency: formData.payFrequency || '',
    },
    financials: {
      monthlyIncome: Number(formData.finMonthlyIncome || formData.monthlyIncome) || 0,
      monthlyHousingExpense: Number(formData.monthlyHousingExpense) || 0,
      estimatedMonthlyExpenses: Number(formData.estimatedMonthlyExpenses) || 0,
    },
    feeAmount,
    feeStatus,
    applicationStatus: APPLICATION_STATUS.SUBMITTED,
    paymentLinkId: null,
    timeline: [
      { event: 'submitted', at: new Date().toISOString(), note: 'Application submitted by customer.' },
    ],
    createdAt: serverTimestamp(),
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // These two writes are independent of each other and non-critical to the
  // customer's flow — fire them in the background rather than blocking
  // navigation to the confirmation page on them. Errors are caught and
  // logged so a failure here never surfaces as a failed submission.
  createNotification(userId, {
    title: 'Application submitted',
    message: `Your application ${reference} has been submitted and is being prepared for review.`,
    type: 'application',
  }).catch((err) => console.error('Failed to create submission notification:', err))

  createAuditLogEntry({
    actorId: userId,
    actorType: 'customer',
    action: 'application_submitted',
    targetId: appRef.id,
    details: { reference, amount, feeAmount },
  }).catch((err) => console.error('Failed to write audit log entry:', err))

  return { id: appRef.id, reference }
}

export async function getApplication(applicationId) {
  const snap = await getDoc(doc(db, 'applications', applicationId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

/**
 * Live-subscribes to an application document. Used on the application detail
 * page so that a payment auto-verified by the Stripe webhook (see
 * functions/index.js) appears immediately, without a manual refresh.
 * Returns an unsubscribe function — call it on unmount.
 */
export function subscribeToApplication(applicationId, onChange, onError) {
  return onSnapshot(
    doc(db, 'applications', applicationId),
    (snap) => onChange(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    onError
  )
}

export async function listUserApplications(userId) {
  const q = query(
    collection(db, 'applications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function listAllApplications() {
  const q = query(collection(db, 'applications'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/**
 * Admin-only status transitions. In production, enforce the admin-only write
 * with Firestore security rules (see firestore.rules) — this client call will
 * be rejected by Firestore for non-admin users regardless of UI restrictions.
 */
export async function updateApplicationStatus(applicationId, status, adminUid, note) {
  const appRef = doc(db, 'applications', applicationId)
  const snap = await getDoc(appRef)
  const timeline = snap.exists() ? snap.data().timeline || [] : []

  await updateDoc(appRef, {
    applicationStatus: status,
    updatedAt: serverTimestamp(),
    timeline: [
      ...timeline,
      { event: `status_${status}`, at: new Date().toISOString(), note: note || '', by: adminUid },
    ],
  })

  await createAuditLogEntry({
    actorId: adminUid,
    actorType: 'admin',
    action: 'application_status_updated',
    targetId: applicationId,
    details: { status, note },
  })

  if (snap.exists()) {
    await createNotification(snap.data().userId, {
      title: 'Application status updated',
      message: `Your application status changed to "${status.replace(/_/g, ' ')}".`,
      type: 'status',
    })
  }
}