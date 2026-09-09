// constants.jsx — non-sensitive, presentation-level constants only.
// Authoritative loan/fee configuration always comes from Firestore (settings/loanConfig),
// never from this file. These are only used as last-resort UI fallbacks/loading states.

export const BRAND = {
  name: 'QuickFund USA',
  shortName: 'QuickFund',
  tagline: 'Simple, transparent short-term loan applications.',
  supportEmail: 'support@quickfundusa.example',
  supportPhone: '(800) 555-0199',
}

export const DEFAULT_LOAN_AMOUNTS = [100, 200, 300, 400, 500, 750, 1000, 1500, 2000]

export const APPLICATION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  ADDITIONAL_INFO: 'additional_information_required',
  APPROVED: 'approved',
  DECLINED: 'declined',
  CANCELLED: 'cancelled',
}

export const FEE_STATUS = {
  PENDING: 'pending',
  PAYMENT_REQUIRED: 'payment_required',
  VERIFICATION_PENDING: 'verification_pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  WAIVED: 'waived',
  NOT_REQUIRED: 'not_required',
}

export const NOTIFICATION_TYPES = {
  APPLICATION: 'application',
  PAYMENT: 'payment',
  STATUS: 'status',
  SYSTEM: 'system',
}

export const US_STATES = [
  ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],
  ['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['FL','Florida'],['GA','Georgia'],
  ['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],
  ['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],
  ['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],['MO','Missouri'],
  ['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],['NJ','New Jersey'],
  ['NM','New Mexico'],['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],
  ['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],
  ['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],
  ['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming'],
  ['DC','District of Columbia'],
]
