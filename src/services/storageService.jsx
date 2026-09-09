// storageService.jsx — browser Local Storage helpers.
// IMPORTANT: only ever store non-sensitive, non-authoritative data here.
// Never store passwords, SSNs, bank/routing/card numbers, driver's license numbers,
// identity documents, or auth tokens. Firestore remains the source of truth.

const DRAFT_KEY = 'qf_application_draft_v1'
const UI_PREFS_KEY = 'qf_ui_preferences_v1'

export function saveApplicationDraft(draft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, savedAt: Date.now() }))
  } catch (e) {
    console.warn('Unable to save application draft locally', e)
  }
}

export function loadApplicationDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    console.warn('Unable to load application draft', e)
    return null
  }
}

export function updateApplicationDraft(partial) {
  const current = loadApplicationDraft() || {}
  const next = { ...current, ...partial }
  saveApplicationDraft(next)
  return next
}

export function clearApplicationDraft() {
  localStorage.removeItem(DRAFT_KEY)
}

export function saveUiPreferences(prefs) {
  try {
    const current = loadUiPreferences() || {}
    localStorage.setItem(UI_PREFS_KEY, JSON.stringify({ ...current, ...prefs }))
  } catch (e) {
    console.warn('Unable to save UI preferences', e)
  }
}

export function loadUiPreferences() {
  try {
    const raw = localStorage.getItem(UI_PREFS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}
