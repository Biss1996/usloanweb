import React from 'react'
import { BRAND } from '../config/constants.jsx'

export default function Privacy() {
  return (
    <div className="container-page max-w-3xl py-16">
      <h1 className="font-display text-4xl font-semibold text-navy-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-navy-400">Last updated: [OPERATOR: insert effective date]</p>

      <div className="prose prose-sm mt-8 max-w-none space-y-6 text-navy-600">
        <section>
          <h2 className="font-display text-xl font-semibold text-navy-900">Information we collect</h2>
          <p className="mt-2 leading-relaxed">
            We collect information you provide directly, such as your name, contact details,
            address, employment, and financial information submitted as part of an application, as
            well as account and usage information.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-navy-900">How we use information</h2>
          <p className="mt-2 leading-relaxed">
            Information is used to process applications, verify identity and eligibility, manage
            your account, communicate with you, and comply with legal obligations. [OPERATOR:
            expand with your specific data-sharing practices, including any third parties used for
            underwriting or payment processing.]
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-navy-900">How we protect information</h2>
          <p className="mt-2 leading-relaxed">
            Sensitive information such as passwords, government ID numbers, and bank details is
            never stored in your browser. Authentication is handled by Firebase Authentication, and
            application data is stored in access-controlled cloud infrastructure.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-navy-900">Your choices</h2>
          <p className="mt-2 leading-relaxed">
            You may update your account information, request a copy of your data, or contact
            support to ask questions about how your information is used.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-navy-900">Contact</h2>
          <p className="mt-2 leading-relaxed">Questions about this policy can be sent to {BRAND.supportEmail}.</p>
        </section>
      </div>
    </div>
  )
}
