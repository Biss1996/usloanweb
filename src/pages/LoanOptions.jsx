import React from 'react'
import { Link } from 'react-router-dom'
import LoanCalculator from '../components/LoanCalculator.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import DisclosureBox from '../components/DisclosureBox.jsx'

export default function LoanOptions() {
  return (
    <div className="container-page py-16">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold text-navy-900">Loan options</h1>
        <p className="mt-4 text-lg text-navy-500">
          Explore available loan amounts and terms, and see transparent, estimated costs before
          you apply.
        </p>
      </div>

      <div className="mt-10">
        <LoanCalculator />
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card>
          <h3 className="font-semibold text-navy-900">Flexible amounts</h3>
          <p className="mt-2 text-sm text-navy-500">
            Requestable loan amounts are configured by our team and shown in the calculator above.
            Availability depends on your state and eligibility.
          </p>
        </Card>
        <Card>
          <h3 className="font-semibold text-navy-900">Short terms</h3>
          <p className="mt-2 text-sm text-navy-500">
            Terms are designed for short-term needs. Your specific term and repayment date are
            confirmed after your application is reviewed.
          </p>
        </Card>
        <Card>
          <h3 className="font-semibold text-navy-900">One-time registration fee</h3>
          <p className="mt-2 text-sm text-navy-500">
            A registration fee may apply based on your requested amount. This is calculated and
            shown to you before submission.
          </p>
        </Card>
      </div>

      <DisclosureBox className="mt-10">
        <p>
          Loan availability, amounts, terms, APR, and fees vary by state and are subject to
          eligibility, verification, and underwriting. Applying does not guarantee approval.
        </p>
      </DisclosureBox>

      <div className="mt-10 text-center">
        <Button as={Link} to="/apply" variant="accent" size="lg">Start your application</Button>
      </div>
    </div>
  )
}
