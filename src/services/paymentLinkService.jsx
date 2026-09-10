// paymentLinkService.jsx — administrator-configured payment links.
//
// Payment URLs are stored in Firestore. The frontend never generates,
// hardcodes or guesses payment URLs.

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'

import { db } from '../config/firebase.jsx'

const PAYMENT_LINKS_COLLECTION = 'paymentLinks'
const MAX_PAYMENT_LINKS = 100
const CACHE_DURATION_MS = 5 * 60 * 1000

let enabledLinksCache = null
let enabledLinksCacheTime = 0
let enabledLinksRequest = null

function isValidHttpsUrl(url) {
  if (typeof url !== 'string' || !url.trim()) {
    return false
  }

  try {
    const parsedUrl = new URL(url.trim())
    return parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

function normalizePaymentLink(documentSnapshot) {
  const data = documentSnapshot.data()

  return {
    id: documentSnapshot.id,
    ...data,
    loanMin: Number(data.loanMin),
    loanMax: Number(data.loanMax),
    url: typeof data.url === 'string'
      ? data.url.trim()
      : '',
    enabled: data.enabled === true,
  }
}

function isValidPaymentLink(link) {
  return (
    link &&
    link.enabled === true &&
    Number.isFinite(link.loanMin) &&
    Number.isFinite(link.loanMax) &&
    link.loanMin >= 0 &&
    link.loanMax >= link.loanMin &&
    isValidHttpsUrl(link.url)
  )
}

function clearPaymentLinkCache() {
  enabledLinksCache = null
  enabledLinksCacheTime = 0
  enabledLinksRequest = null
}

function isCacheFresh() {
  return (
    Array.isArray(enabledLinksCache) &&
    Date.now() - enabledLinksCacheTime < CACHE_DURATION_MS
  )
}

/**
 * Lists payment links for the administrator interface.
 *
 * This always requests current Firestore data because administrators need
 * to see recent configuration changes.
 */
export async function listPaymentLinks() {
  const paymentLinksQuery = query(
    collection(db, PAYMENT_LINKS_COLLECTION),
    orderBy('loanMin', 'asc'),
    limit(MAX_PAYMENT_LINKS)
  )

  const snapshot = await getDocs(paymentLinksQuery)

  return snapshot.docs.map(normalizePaymentLink)
}

/**
 * Loads enabled links and caches them briefly.
 *
 * Simultaneous components reuse the same request instead of generating
 * multiple Firestore reads.
 */
async function getEnabledPaymentLinks() {
  if (isCacheFresh()) {
    return enabledLinksCache
  }

  if (enabledLinksRequest) {
    return enabledLinksRequest
  }

  const enabledLinksQuery = query(
    collection(db, PAYMENT_LINKS_COLLECTION),
    where('enabled', '==', true),
    orderBy('loanMin', 'asc'),
    limit(MAX_PAYMENT_LINKS)
  )

  enabledLinksRequest = getDocs(enabledLinksQuery)
    .then((snapshot) => {
      const links = snapshot.docs
        .map(normalizePaymentLink)
        .filter(isValidPaymentLink)

      enabledLinksCache = links
      enabledLinksCacheTime = Date.now()

      return links
    })
    .finally(() => {
      enabledLinksRequest = null
    })

  return enabledLinksRequest
}

/**
 * Finds an enabled payment link whose configured loan range contains the
 * requested loan amount.
 */
export async function findPaymentLinkForAmount(requestedAmount) {
  const amount = Number(requestedAmount)

  if (!Number.isFinite(amount) || amount <= 0) {
    return null
  }

  const links = await getEnabledPaymentLinks()

  // Prefer the most specific matching range.
  const matchingLinks = links
    .filter(
      (link) =>
        amount >= link.loanMin &&
        amount <= link.loanMax
    )
    .sort((first, second) => {
      const firstRange = first.loanMax - first.loanMin
      const secondRange = second.loanMax - second.loanMin

      if (firstRange !== secondRange) {
        return firstRange - secondRange
      }

      return second.loanMin - first.loanMin
    })

  return matchingLinks[0] || null
}

/**
 * Creates or updates an administrator-configured payment link.
 */
export async function upsertPaymentLink(id, data) {
  if (!id || typeof id !== 'string') {
    throw new Error('A payment-link ID is required.')
  }

  const loanMin = Number(data.loanMin)
  const loanMax = Number(data.loanMax)
  const url = typeof data.url === 'string'
    ? data.url.trim()
    : ''

  if (!Number.isFinite(loanMin) || loanMin < 0) {
    throw new Error('Minimum loan amount must be valid.')
  }

  if (!Number.isFinite(loanMax) || loanMax < loanMin) {
    throw new Error(
      'Maximum loan amount must be greater than or equal to the minimum.'
    )
  }

  if (!isValidHttpsUrl(url)) {
    throw new Error('Payment URL must be a valid HTTPS URL.')
  }

  await setDoc(
    doc(db, PAYMENT_LINKS_COLLECTION, id),
    {
      ...data,
      loanMin,
      loanMax,
      url,
      enabled: data.enabled === true,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  )

  clearPaymentLinkCache()
}

/**
 * Deletes an administrator-configured payment link.
 */
export async function deletePaymentLink(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('A payment-link ID is required.')
  }

  await deleteDoc(
    doc(db, PAYMENT_LINKS_COLLECTION, id)
  )

  clearPaymentLinkCache()
}

export {
  clearPaymentLinkCache,
  isValidHttpsUrl,
}