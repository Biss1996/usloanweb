import React from 'react'

export default function Disclosures() {
  return (
    <div className="container-page max-w-3xl py-16">
      <h1 className="font-display text-4xl font-semibold text-navy-900">Disclosures</h1>
      <div className="prose prose-sm mt-8 max-w-none space-y-6 text-navy-600">
        <section>
          <h2 className="font-display text-xl font-semibold text-navy-900">General disclosures</h2>
          <p className="mt-2 leading-relaxed">
            Loan amounts, APR, fees, and terms shown throughout this site are estimates and are
            subject to change based on your eligibility, verification, underwriting, and applicable
            state law. Final terms, if approved, will be disclosed to you directly before you accept
            any loan.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-navy-900">State availability</h2>
          <p className="mt-2 leading-relaxed">
            Loan products described on this site are not available in all states. [OPERATOR: insert
            your specific state licensing information, license numbers, and any required
            state-specific disclosures here.]
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-navy-900">Registration fee</h2>
          <p className="mt-2 leading-relaxed">
            A one-time registration fee may apply based on your requested loan amount, calculated
            using our current fee schedule at the time you submit your application.
          </p>
        </section>
      </div>
    </div>
  )
}
