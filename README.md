# QuickFund USA

A complete, working example of a modern short-term loan application platform, built with
**React + Vite + Tailwind CSS + Firebase**. QuickFund USA is a fictional demonstration brand —
this is not a real, licensed lender.

## Tech stack

- React 18 + React Router 6, JSX files only
- Vite
- Tailwind CSS
- Firebase Authentication + Firestore
- Browser Local Storage for non-sensitive application drafts only

---

## 1. Getting started

### Requirements

- Node.js 18+ and npm
- A Firebase project (free "Spark" plan is enough to start)

### Install and run

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Until you connect a real Firebase project (step 2),
authentication and Firestore calls will fail — the app still renders, but sign-in/data
features need Firebase configured.

---

## 2. Firebase project setup

1. Go to the [Firebase Console](https://console.firebase.google.com) and create a new project.
2. In **Project settings → General → Your apps**, add a **Web app** and copy the config values.
3. Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

```
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
```

`.env` is gitignored — never commit real credentials.

### Enable Authentication

In the Firebase Console: **Authentication → Sign-in method → Email/Password → Enable**.

### Enable Firestore

**Firestore Database → Create database** (production mode is recommended).

### Deploy Firestore rules and indexes

Install the Firebase CLI if you don't have it, then from the project root:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # point it at this project; use existing firestore.rules / firestore.indexes.json
firebase deploy --only firestore:rules,firestore:indexes
```

This deploys `firestore.rules` (security rules) and `firestore.indexes.json` (composite indexes
needed for the admin filtering/sorting queries).

---

## 3. Creating an administrator

Admin access is granted via a **Firebase custom claim** (`admin: true`) on a user's account —
never via a Firestore field a browser could write to. This requires the Firebase Admin SDK,
which runs in a trusted server environment (a Cloud Function, a one-off Node script, etc.),
**not** in the React app.

Example one-off Node script (run locally with a service account key, never shipped to the browser):

```js
// setAdmin.js — run with: node setAdmin.js someone@example.com
const admin = require('firebase-admin')
admin.initializeApp({ credential: admin.credential.applicationDefault() })

const email = process.argv[2]
admin.auth().getUserByEmail(email)
  .then((user) => admin.auth().setCustomUserClaims(user.uid, { admin: true }))
  .then(() => console.log(`${email} is now an administrator.`))
  .catch(console.error)
```

1. In the Firebase Console, go to **Project settings → Service accounts → Generate new private key**.
2. Set `GOOGLE_APPLICATION_CREDENTIALS` to point at the downloaded JSON key file.
3. Run `node setAdmin.js you@example.com` after that user has registered a normal account
   through the app.
4. The user must sign out and back in (or wait for their ID token to refresh) for the new
   claim to take effect — `authService.getIsAdmin()` calls `getIdTokenResult(true)` to force
   a refresh on load.

Once an account has the `admin` claim, they can access `/admin` and everything under it.

---

## 4. Loan &amp; registration fee configuration

All loan parameters live in Firestore at **`settings/loanConfig`** and are editable from
**Admin → Loan Configuration** (`/admin/settings/loans`) once you're signed in as an admin —
no code changes required. If the document doesn't exist yet, the app falls back to sensible
defaults (see `src/services/settingsService.jsx`) until an admin saves the form once.

Fields:

| Field | Purpose |
|---|---|
| `minLoanAmount`, `maxLoanAmount` | Overall requestable range |
| `loanIncrements` | Array of selectable amounts (e.g. `[100,200,300,500,1000]`) |
| `apr` | Used only to compute the *estimated* finance charge shown to applicants |
| `minimumTerm`, `maximumTerm` | Loan term range, in days |
| `registrationFeeEnabled` | Master on/off switch for the fee |
| `feeThreshold` | Loans at/below this amount use `smallLoanFee`; above use `largeLoanFee` |
| `smallLoanFee`, `largeLoanFee` | Default: $50 / $100 |
| `applicationsEnabled` | Site-wide kill switch for new applications |

**Important:** the fee is calculated once, at submission time, and stored directly on the
`applications/{id}` document as `feeAmount`. Changing `settings/loanConfig` later never
retroactively changes an already-submitted application's fee.

---

## 5. Adding real Firebase payment links

QuickFund USA **never** builds its own checkout page or payment URL. Instead, an administrator
adds real, external payment-provider links directly in Firestore, and the app looks one up by
matching the applicant's requested loan amount against a link's `loanMin`–`loanMax` range.

### Recommended way: the admin UI

1. Sign in as an administrator and go to **Admin → Payment Links** (`/admin/payment-links`).
2. Click **Add payment link** and fill in:
   - **Name** — e.g. `$50 Registration Fee`
   - **Fee amount** — e.g. `50`
   - **Loan range** — e.g. `100`–`1000`
   - **Payment URL** — the real HTTPS checkout link from your payment provider
   - **Enabled** — toggle on
3. Repeat for the `$100` tier with range `1001`–`2000` (or whatever ranges fit your fee schedule).

No frontend code changes are ever required to add, edit, disable, or remove a payment link.

### Alternative: directly in the Firestore console

Create documents under the `paymentLinks` collection, e.g.:

```
paymentLinks/fee50
  name: "$50 Registration Fee"
  amount: 50
  url: "https://your-real-payment-provider.com/checkout/..."
  enabled: true
  loanMin: 100
  loanMax: 1000

paymentLinks/fee100
  name: "$100 Registration Fee"
  amount: 100
  url: "https://your-real-payment-provider.com/checkout/..."
  enabled: true
  loanMin: 1001
  loanMax: 2000
```

### How the redirect works

1. On the application detail page, the customer clicks **Pay Registration Fee**.
2. `paymentService.redirectToPayment()` re-fetches the application from Firestore, confirms
   the signed-in user owns it and that `feeStatus === 'payment_required'`.
3. It queries `paymentLinks` for an **enabled** link whose range covers the requested amount,
   and validates the URL is HTTPS.
4. If found, the browser is redirected with `window.location.href = paymentUrl`.
5. If no valid, enabled link is found, the customer sees: *"Online payment is currently
   unavailable. Please check again later or contact support."* — the rest of the app keeps
   working normally.

### Confirming a payment

Because the actual charge happens on your external payment provider's site, the app **never**
trusts a browser redirect back as proof of payment, and ordinary users can never set their own
`feeStatus` to `paid` (enforced in `firestore.rules`). For now, an administrator confirms
payment manually from **Admin → Applications → [application] → Mark Payment Verified**, which
requires a confirmation dialog and writes an `auditLogs` entry. The architecture is ready to
plug in a payment-provider webhook later (e.g. a Cloud Function that verifies the provider's
signature and then performs the same Firestore update `markPaymentVerified` does).

---

## 6. Firestore data model (summary)

```
users/{uid}
  firstName, lastName, email, phone, state, accountStatus, role, createdAt, updatedAt
  users/{uid}/notifications/{id}
    title, message, type, read, createdAt

applications/{id}
  userId, reference, requestedAmount, loanTerm, loanPurpose
  applicant { firstName, lastName, dateOfBirth, phone, email, ... }
  address { street, city, state, zip, ... }
  employment { status, employerName, monthlyIncome, ... }
  financials { monthlyIncome, monthlyHousingExpense, estimatedMonthlyExpenses }
  feeAmount, feeStatus, feeVerifiedAt, feeVerifiedBy
  applicationStatus, paymentLinkId, timeline[], createdAt, submittedAt, updatedAt

settings/loanConfig     — admin-configurable loan & fee parameters
paymentLinks/{id}       — admin-managed external payment URLs
states/{code}           — per-state availability toggles
contactMessages/{id}    — public contact form submissions
auditLogs/{id}          — append-only record of sensitive actions
```

---

## 7. Security considerations

- **No sensitive data in Local Storage.** Only non-sensitive draft fields (loan amount, term,
  step progress, non-financial form fields) are cached client-side, via `storageService.jsx`.
  Passwords, SSNs, bank/card numbers, and IDs are never written there.
- **Passwords** are handled entirely by Firebase Authentication; this app never sees or stores
  plaintext passwords.
- **Admin access** is enforced by a Firebase custom claim, checked both in the UI
  (`AdminRoute`) and — critically — in `firestore.rules`, so a modified client can't fake
  admin access.
- **Payment status** (`feeStatus`) can only move to `paid`/`refunded`/`waived` via an
  admin-only Firestore write; customers can only set `paymentLinkId` on their own application
  as part of initiating a redirect.
- **Applications** can only be created by their owner, in `submitted` status, and application
  status can only be changed by an admin.
- **Payment links** are read-only for customers and writable only by admins.
- Every Firebase write path used by the UI has a matching restriction in `firestore.rules` —
  treat the rules file as the actual source of truth for what's allowed, not the UI.

---

## 8. Production deployment

1. Set real environment variables (`.env` or your host's env var settings) — never commit
   real Firebase keys to source control.
2. `npm run build` produces a static `dist/` folder deployable to Firebase Hosting, Vercel,
   Netlify, or any static host.
3. Deploy Firestore rules/indexes with `firebase deploy --only firestore:rules,firestore:indexes`.
4. Set at least one administrator account (see section 3) before relying on the admin
   dashboard.
5. Add your real payment links (see section 5) before enabling applications for customers.
6. Have qualified legal counsel review `/terms`, `/privacy`, `/disclosures`,
   `/e-sign-consent`, and `/responsible-lending` before going live — the placeholder text in
   this repo (marked `[OPERATOR: ...]`) is not legal advice and does not include real
   licensing information.

---

## 9. Project structure

```
src/
  components/       Reusable UI (Navbar, Footer, Hero, forms, badges, modals, ui/ primitives)
  layouts/           PublicLayout, DashboardLayout, AdminLayout
  pages/             Public marketing + legal pages, auth pages, Apply flow
  pages/dashboard/   Customer dashboard (Overview, Applications, Detail, Notifications, Profile)
  pages/admin/       Admin console (Overview, Applications, Users, Payments, Payment Links,
                     Loan Settings, States, Contact Messages, Audit Logs)
  services/          All Firebase reads/writes, grouped by domain
  context/, hooks/   AuthContext + useAuth
  utils/             Validation and formatting helpers
  config/            firebase.jsx (init) and constants.jsx (non-sensitive UI constants)
firestore.rules
firestore.indexes.json
.env.example
```

---

## 10. Commands

```bash
npm install       # install dependencies
npm run dev       # start local dev server
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```
