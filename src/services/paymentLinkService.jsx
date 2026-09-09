// paymentLinkService.jsx — retrieves administrator-configured payment links from Firestore.
// The frontend NEVER generates, hardcodes, or guesses a payment URL.
import { collection, getDocs, query, where, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase.jsx'

function isValidHttpsUrl(url) {
  try {
    const u = new URL(url)
    return u.protocol === 'https:'
  } catch {
    return false
  }
}

export async function listPaymentLinks() {
  const snap = await getDocs(collection(db, 'paymentLinks'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/**
 * Finds the enabled payment link whose loan range covers the given fee amount
 * context. Loans are matched by requestedAmount falling within [loanMin, loanMax].
 */
export async function findPaymentLinkForAmount(requestedAmount) {
  const q = query(collection(db, 'paymentLinks'), where('enabled', '==', true))
  const snap = await getDocs(q)
  const links = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  const match = links.find(
    (l) => requestedAmount >= l.loanMin && requestedAmount <= l.loanMax && isValidHttpsUrl(l.url)
  )
  return match || null
}

export async function upsertPaymentLink(id, data) {
  if (data.url && !isValidHttpsUrl(data.url)) {
    throw new Error('Payment URL must be a valid HTTPS URL.')
  }
  await setDoc(doc(db, 'paymentLinks', id), { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

export async function deletePaymentLink(id) {
  await deleteDoc(doc(db, 'paymentLinks', id))
}

export { isValidHttpsUrl }
