// applicationService.jsx — loan application CRUD against Firestore.
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'

import { db } from '../config/firebase.jsx'
import {
  APPLICATION_STATUS,
  FEE_STATUS,
} from '../config/constants.jsx'

import { calculateRegistrationFee } from './settingsService.jsx'
import { createAuditLogEntry } from './adminService.jsx'
import { createNotification } from './notificationService.jsx'

const USER_APPLICATION_LIMIT = 50
const ADMIN_APPLICATION_LIMIT = 100

function generateReference() {
  const year = new Date().getFullYear()
  const randomNumber = Math.floor(100000 + Math.random() * 900000)

  return `QF-${year}-${randomNumber}`
}

/**
 * Submits a completed loan application.
 */
export async function submitApplication({
  userId,
  formData,
  loanConfig,
}) {
  if (!userId) {
    throw new Error('A signed-in user is required to submit an application.')
  }

  if (!loanConfig) {
    throw new Error('Loan configuration is unavailable.')
  }

  const amount = Number(formData.loanAmount)

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Please enter a valid loan amount.')
  }

  const feeAmount = calculateRegistrationFee(amount, loanConfig)

  const feeStatus =
    feeAmount > 0
      ? FEE_STATUS.PAYMENT_REQUIRED
      : FEE_STATUS.NOT_REQUIRED

  const reference = generateReference()

  // Only this primary write blocks the customer's submission flow.
  const applicationReference = await addDoc(
    collection(db, 'applications'),
    {
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
        monthlyIncome:
          Number(
            formData.finMonthlyIncome ||
            formData.monthlyIncome
          ) || 0,

        monthlyHousingExpense:
          Number(formData.monthlyHousingExpense) || 0,

        estimatedMonthlyExpenses:
          Number(formData.estimatedMonthlyExpenses) || 0,
      },

      feeAmount,
      feeStatus,
      applicationStatus: APPLICATION_STATUS.SUBMITTED,
      paymentLinkId: null,

      timeline: [
        {
          event: 'submitted',
          at: new Date().toISOString(),
          note: 'Application submitted - check progress on dashboard.',
        },
      ],

      createdAt: serverTimestamp(),
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  )

  // These writes are secondary and should not delay confirmation.
  void Promise.allSettled([
    createNotification(userId, {
      title: 'Application submitted',
      message:
        `Your application ${reference} has been submitted ` +
        'and is being prepared for review.',
      type: 'application',
    }),

    createAuditLogEntry({
      actorId: userId,
      actorType: 'customer',
      action: 'application_submitted',
      targetId: applicationReference.id,
      details: {
        reference,
        amount,
        feeAmount,
      },
    }),
  ]).then((results) => {
    results.forEach((result, index) => {
      if (result.status !== 'rejected') return

      const operation =
        index === 0 ? 'notification' : 'audit log'

      console.error(
        `Failed to create submission ${operation}:`,
        result.reason
      )
    })
  })

  return {
    id: applicationReference.id,
    reference,
  }
}

/**
 * Gets one application by its document ID.
 */
export async function getApplication(applicationId) {
  if (!applicationId) return null

  const snapshot = await getDoc(
    doc(db, 'applications', applicationId)
  )

  return snapshot.exists()
    ? {
        id: snapshot.id,
        ...snapshot.data(),
      }
    : null
}

/**
 * Subscribes to one application.
 *
 * The returned function must be called when the component unmounts.
 */
export function subscribeToApplication(
  applicationId,
  onChange,
  onError
) {
  if (!applicationId) {
    onChange(null)
    return () => {}
  }

  return onSnapshot(
    doc(db, 'applications', applicationId),

    (snapshot) => {
      onChange(
        snapshot.exists()
          ? {
              id: snapshot.id,
              ...snapshot.data(),
            }
          : null
      )
    },

    (error) => {
      console.error(
        'Application subscription failed:',
        error
      )

      if (onError) onError(error)
    }
  )
}

/**
 * Gets the most recent applications belonging to one customer.
 */
export async function listUserApplications(
  userId,
  resultLimit = USER_APPLICATION_LIMIT
) {
  if (!userId) return []

  const safeLimit = Math.min(
    Math.max(Number(resultLimit) || USER_APPLICATION_LIMIT, 1),
    USER_APPLICATION_LIMIT
  )

  const applicationsQuery = query(
    collection(db, 'applications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(safeLimit)
  )

  const snapshot = await getDocs(applicationsQuery)

  return snapshot.docs.map((documentSnapshot) => ({
    id: documentSnapshot.id,
    ...documentSnapshot.data(),
  }))
}

/**
 * Gets the most recent applications for the admin dashboard.
 */
export async function listAllApplications(
  resultLimit = ADMIN_APPLICATION_LIMIT
) {
  const safeLimit = Math.min(
    Math.max(Number(resultLimit) || ADMIN_APPLICATION_LIMIT, 1),
    ADMIN_APPLICATION_LIMIT
  )

  const applicationsQuery = query(
    collection(db, 'applications'),
    orderBy('createdAt', 'desc'),
    limit(safeLimit)
  )

  const snapshot = await getDocs(applicationsQuery)

  return snapshot.docs.map((documentSnapshot) => ({
    id: documentSnapshot.id,
    ...documentSnapshot.data(),
  }))
}

/**
 * Updates an application's status.
 *
 * Firestore security rules must restrict this operation to administrators.
 */
export async function updateApplicationStatus(
  applicationId,
  status,
  adminUid,
  note
) {
  if (!applicationId || !status || !adminUid) {
    throw new Error(
      'Application ID, status and administrator ID are required.'
    )
  }

  const applicationReference = doc(
    db,
    'applications',
    applicationId
  )

  const applicationSnapshot = await getDoc(
    applicationReference
  )

  if (!applicationSnapshot.exists()) {
    throw new Error('Application not found.')
  }

  const application = applicationSnapshot.data()
  const timeline = Array.isArray(application.timeline)
    ? application.timeline
    : []

  // The primary status update must succeed first.
  await updateDoc(applicationReference, {
    applicationStatus: status,
    updatedAt: serverTimestamp(),

    timeline: [
      ...timeline,
      {
        event: `status_${status}`,
        at: new Date().toISOString(),
        note: note || '',
        by: adminUid,
      },
    ],
  })

  // Run the two independent follow-up operations concurrently.
  await Promise.all([
    createAuditLogEntry({
      actorId: adminUid,
      actorType: 'admin',
      action: 'application_status_updated',
      targetId: applicationId,
      details: {
        status,
        note: note || '',
      },
    }),

    createNotification(application.userId, {
      title: 'Application status updated',
      message:
        `Your application status changed to ` +
        `"${status.replace(/_/g, ' ')}".`,
      type: 'status',
    }),
  ])
}