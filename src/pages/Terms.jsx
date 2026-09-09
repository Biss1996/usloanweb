import React from 'react'
import { BRAND } from '../config/constants.jsx'

export default function Terms() {
  return (
    <div className="container-page max-w-3xl py-16">
      <h1 className="font-display text-4xl font-semibold text-navy-900">Terms of Use</h1>
      <p className="mt-2 text-sm text-navy-400">Last updated: [OPERATOR: insert effective date]</p>

      <div className="prose prose-sm mt-8 max-w-none space-y-6 text-navy-600">
        <section>
          <h2 className="font-display text-xl font-semibold text-navy-900">1. Acceptance of terms</h2>
          <p className="mt-2 leading-relaxed">
            By creating an account or submitting an application through {BRAND.name}, you agree to
            these Terms of Use. [OPERATOR: replace this placeholder document with counsel-reviewed
            terms specific to your entity, licensing, and states of operation.]
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-navy-900">2. Eligibility</h2>
          <p className="mt-2 leading-relaxed">
            You must be at least 18 years old, a resident of a state where our services are
            available, and able to provide accurate identifying and financial information to use
            this service.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-navy-900">3. No guarantee of approval</h2>
          <p className="mt-2 leading-relaxed">
            Submitting an application does not guarantee approval, funding, or any specific loan
            terms. All applications are subject to eligibility review, verification, underwriting,
            and applicable law.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-navy-900">4. Fees and payments</h2>
          <p className="mt-2 leading-relaxed">
            A registration fee may apply to your application as described at the time of
            submission. Payments are processed by a third-party payment provider; {BRAND.name}
            does not directly collect or store payment card information.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-navy-900">5. Account responsibilities</h2>
          <p className="mt-2 leading-relaxed">
            You are responsible for maintaining the confidentiality of your account credentials and
            for all activity that occurs under your account.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-navy-900">6. Changes to these terms</h2>
          <p className="mt-2 leading-relaxed">
            [OPERATOR: describe your process for notifying users of material changes to these
            terms.]
          </p>
        </section>
      </div>
    </div>
  )
}
