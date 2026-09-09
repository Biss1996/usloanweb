import React from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import DisclosureBox from '../components/DisclosureBox.jsx'

const STEPS = [
  ['Check your loan options', 'Use the calculator to see estimated fees, APR, and repayment for different amounts and terms before you apply.'],
  ['Create your account', 'Register with your name, contact details, and state. Your account is protected with Firebase Authentication.'],
  ['Complete the application', 'Provide your personal, address, employment, and financial information across a guided, multi-step form. You can save your progress and come back later.'],
  ['Review and submit', 'Review everything you entered, confirm the accuracy of your information, and submit your application.'],
  ['Pay the registration fee, if applicable', 'If a registration fee applies to your requested amount, you will be redirected to a secure external payment provider to complete it.'],
  ['Underwriting review', 'Your application is reviewed for eligibility. This is independent from your registration fee payment status.'],
  ['Get your decision', 'Track your status from your dashboard. If additional information is needed, we will let you know exactly what to provide.'],
]

export default function HowItWorks() {
  return (
    <div className="container-page py-16">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold text-navy-900">How it works</h1>
        <p className="mt-4 text-lg text-navy-500">
          From application to decision, here's exactly what to expect at every step.
        </p>
      </div>

      <ol className="mt-12 space-y-6">
        {STEPS.map(([title, desc], i) => (
          <li key={title}>
            <Card className="flex gap-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-navy-900 font-display text-sm font-semibold text-white">
                {i + 1}
              </div>
              <div>
                <h2 className="font-semibold text-navy-900">{title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-500">{desc}</p>
              </div>
            </Card>
          </li>
        ))}
      </ol>

      <DisclosureBox className="mt-10">
        <p>
          Submitting an application does not guarantee approval, funding, or specific loan terms.
          All requests are subject to eligibility, verification, underwriting, applicable state law,
          and lender availability.
        </p>
      </DisclosureBox>

      <div className="mt-10 text-center">
        <Button as={Link} to="/apply" variant="accent" size="lg">Check Loan Options</Button>
      </div>
    </div>
  )
}
