// validation.jsx — shared client-side validation helpers.
// NOTE: frontend validation improves UX only. Protected values (status, fee
// amounts, payment state) are never trusted from the client — Firestore rules
// and admin-only writes are the real enforcement layer.

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

export function isValidUsPhone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))
}

export function isValidZip(value) {
  return /^\d{5}(-\d{4})?$/.test(String(value || '').trim())
}

export function isAdult(dateOfBirth) {
  if (!dateOfBirth) return false
  const dob = new Date(dateOfBirth)
  if (Number.isNaN(dob.getTime())) return false
  const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  return age >= 18
}

export function isValidLoanAmount(amount, min, max) {
  const n = Number(amount)
  return Number.isFinite(n) && n >= min && n <= max
}

export function isValidMonthlyIncome(value) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0
}

export function isRequired(value) {
  return value !== undefined && value !== null && String(value).trim().length > 0
}

export function isValidHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export function isValidState(code, statesList) {
  if (!code) return false
  if (!statesList) return code.length === 2
  return statesList.some((s) => s.id === code || s.stateCode === code)
}
