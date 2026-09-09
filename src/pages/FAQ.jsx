import React, { useState } from 'react'

const FAQS = [
  ['How does the application process work?', 'You create an account, complete a short multi-step application covering your personal, address, employment, and financial information, then review and submit. You can track status from your dashboard afterward.'],
  ['Does applying guarantee approval?', 'No. Submitting an application never guarantees approval, funding, or specific terms. Every request goes through eligibility checks, verification, and underwriting, and is subject to applicable state law.'],
  ['What loan amounts are available?', 'Available amounts and increments are configured by our team and shown in the loan calculator on the Loan Options page. Availability can vary by state.'],
  ['How does the registration fee work?', 'A one-time registration fee may apply depending on your requested loan amount. The exact fee is calculated using our current fee schedule and shown to you before you submit your application. Once your application is submitted, that fee amount is locked in and will not change even if our fee schedule changes later.'],
  ['How do I pay my registration fee?', 'From your application details page, select "Pay Registration Fee." You will be redirected to a secure, external payment provider to complete payment. We do not collect card details directly on this site.'],
  ['Why does the payment page open another website?', 'Payments are handled by a dedicated, external payment provider rather than our own servers. This keeps your payment information off our platform entirely.'],
  ['How can I see my application status?', 'Sign in and visit your dashboard. Each application shows its current status, along with your registration fee and payment status.'],
  ['Is my information secure?', 'Yes. Accounts are secured with Firebase Authentication, and sensitive details such as passwords, bank information, and identification numbers are never stored in your browser — only in our secured backend.'],
  ['Can I cancel my application?', 'Yes, you can contact support to request cancellation of a pending application. If your application has already reached a final decision, contact support to discuss your options.'],
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="container-page py-16">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold text-navy-900">Frequently asked questions</h1>
        <p className="mt-4 text-lg text-navy-500">
          Answers to common questions about applying, fees, payments, and your data.
        </p>
      </div>

      <div className="mt-10 divide-y divide-navy-100 rounded-2xl border border-navy-100 bg-white shadow-card">
        {FAQS.map(([q, a], i) => {
          const open = openIndex === i
          return (
            <div key={q}>
              <button
                onClick={() => setOpenIndex(open ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={open}
              >
                <span className="font-medium text-navy-900">{q}</span>
                <svg
                  className={`h-5 w-5 flex-shrink-0 text-navy-400 transition-transform ${open ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20" fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
              {open && <p className="px-6 pb-5 text-sm leading-relaxed text-navy-500">{a}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
