// settingsService.jsx — reads/writes admin-configurable loan settings & state availability.
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase.jsx'
import { DEFAULT_LOAN_AMOUNTS } from '../config/constants.jsx'

const LOAN_CONFIG_PATH = ['settings', 'loanConfig']

// Fallback used only while Firestore data is loading or if a document has not
// been created yet. The admin dashboard is the authoritative source.
export const FALLBACK_LOAN_CONFIG = {
  minLoanAmount: 500,
  maxLoanAmount: 10000,
  loanIncrements: DEFAULT_LOAN_AMOUNTS,
  apr: 250,
  minimumTerm: 14,
  maximumTerm: 90,
  applicationsEnabled: true,
  registrationFeeEnabled: true,
  feeThreshold: 1000,
  smallLoanFee: 50,
  largeLoanFee: 100,
}

export async function getLoanConfig() {
  const snap = await getDoc(doc(db, ...LOAN_CONFIG_PATH))
  if (!snap.exists()) return FALLBACK_LOAN_CONFIG
  return { ...FALLBACK_LOAN_CONFIG, ...snap.data() }
}

export async function updateLoanConfig(partial) {
  await setDoc(
    doc(db, ...LOAN_CONFIG_PATH),
    { ...partial, updatedAt: serverTimestamp() },
    { merge: true }
  )
}

/** Calculates the registration fee for a given loan amount from a loanConfig object. */
export function calculateRegistrationFee(amount, loanConfig) {
  if (!loanConfig?.registrationFeeEnabled) return 0
  return amount > loanConfig.feeThreshold ? loanConfig.largeLoanFee : loanConfig.smallLoanFee
}

/** Rough, clearly-labeled estimate only — final terms are provided during underwriting. */
export function estimateFinanceCharge(amount, apr, termDays) {
  const dailyRate = apr / 100 / 365
  return Math.round(amount * dailyRate * termDays * 100) / 100
}

export async function listStates() {
  const snap = await getDocs(collection(db, 'states'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getState(stateCode) {
  const snap = await getDoc(doc(db, 'states', stateCode))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function upsertState(stateCode, data) {
  await setDoc(
    doc(db, 'states', stateCode),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  )
}
