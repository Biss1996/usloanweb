import React from 'react'
import DisclosureBox from '../components/DisclosureBox.jsx'

export default function ResponsibleLending() {
  return (
    <div className="container-page max-w-3xl py-16">
      <h1 className="font-display text-4xl font-semibold text-navy-900">Responsible Borrowing</h1>
      <p className="mt-4 text-lg text-navy-500">
        Short-term loans can be a useful tool, but they can also be an expensive way to borrow.
        Here's what to consider before you apply.
      </p>

      <div className="prose prose-sm mt-10 max-w-none space-y-6 text-navy-600">
        <section>
          <h2 className="font-display text-xl font-semibold text-navy-900">Understand the full cost</h2>
          <p className="mt-2 leading-relaxed">
            Before accepting any loan, review the estimated APR, all applicable fees, and your total
            repayment amount — not just the amount you'll receive. Our calculator shows these
            figures up front.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-navy-900">Consider your repayment plan</h2>
          <p className="mt-2 leading-relaxed">
            Short-term loans are typically due in a single period. Think through how repayment will
            fit your income and expenses before you borrow.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-navy-900">Explore alternatives</h2>
          <p className="mt-2 leading-relaxed">
            Depending on your situation, options such as a payment plan with a creditor, assistance
            programs, or borrowing from a credit union may cost less than a short-term loan.
          </p>
        </section>
      </div>

      <DisclosureBox className="mt-10">
        <p>
          Eligibility, availability, and terms vary by state and individual circumstances.
          Applying does not guarantee approval, funding, or any specific loan terms.
        </p>
      </DisclosureBox>
    </div>
  )
}
