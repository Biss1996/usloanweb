import React from 'react'

export default function ESignConsent() {
  return (
    <div className="container-page max-w-3xl py-16">
      <h1 className="font-display text-4xl font-semibold text-navy-900">Electronic Communications Consent</h1>
      <div className="prose prose-sm mt-8 max-w-none space-y-6 text-navy-600">
        <p className="leading-relaxed">
          By creating an account, you consent to receive communications from us electronically,
          including account notices, application status updates, and required disclosures, instead
          of by postal mail.
        </p>
        <section>
          <h2 className="font-display text-xl font-semibold text-navy-900">Your right to paper copies</h2>
          <p className="mt-2 leading-relaxed">
            You may request a paper copy of any electronic communication by contacting support.
            [OPERATOR: describe any associated fee, if applicable, and your specific process.]
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-navy-900">Withdrawing consent</h2>
          <p className="mt-2 leading-relaxed">
            You may withdraw your consent to electronic communications at any time by contacting
            support, which may affect your ability to use certain features of this service.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-navy-900">System requirements</h2>
          <p className="mt-2 leading-relaxed">
            To access electronic communications, you will need a device with internet access, a
            current web browser, and a valid email address.
          </p>
        </section>
      </div>
    </div>
  )
}
