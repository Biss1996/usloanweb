import React from 'react'
import { Link } from 'react-router-dom'

import LoanCalculator from '../components/LoanCalculator.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import DisclosureBox from '../components/DisclosureBox.jsx'

export default function LoanOptions() {
  return (
    <main className="container-page py-16">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold text-navy-900">
          Loan options
        </h1>

        <p className="mt-4 text-lg text-navy-500">
          Explore available loan amounts, estimated terms and
          potential costs before submitting an application.
        </p>
      </header>

      <section
        className="mt-10"
        aria-labelledby="loan-calculator-heading"
      >
        <h2
          id="loan-calculator-heading"
          className="sr-only"
        >
          Loan calculator
        </h2>

        <LoanCalculator />
      </section>

      <section
        className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3"
        aria-label="Loan information"
      >
        <Card>
          <h2 className="font-semibold text-navy-900">
            Available amounts
          </h2>

          <p className="mt-2 text-sm text-navy-500">
            Available amounts may depend on your state,
            eligibility, verification and underwriting.
          </p>
        </Card>

        <Card>
          <h2 className="font-semibold text-navy-900">
            Repayment terms
          </h2>

          <p className="mt-2 text-sm text-navy-500">
            The repayment period, payment schedule and due dates
            will be disclosed before you enter a loan agreement.
          </p>
        </Card>

        <Card>
          <h2 className="font-semibold text-navy-900">
            Clear disclosures
          </h2>

          <p className="mt-2 text-sm text-navy-500">
            Review the applicable APR, finance charges, payment
            schedule and total repayment amount before accepting
            an offer.
          </p>
        </Card>
      </section>

      <DisclosureBox className="mt-10">
        <p>
          Loan availability, amounts, terms, APR and fees vary by
          state and are subject to eligibility, verification and
          underwriting. Submitting an application does not
          guarantee approval or funding. Review all disclosures
          before accepting a loan.
        </p>
      </DisclosureBox>

      <div className="mt-10 text-center">
        <Button
          as={Link}
          to="/apply"
          variant="accent"
          size="lg"
        >
          Check available options
        </Button>
      </div>
    </main>
  )
}