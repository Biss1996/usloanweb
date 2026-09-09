import React from 'react'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero.jsx'
import LoanCalculator from '../components/LoanCalculator.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { BRAND } from '../config/constants.jsx'

const BENEFITS = [
  {
    title: 'Simple Online Application',
    desc: 'Apply from your phone or computer in about five minutes — no branch visit required.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V18a2 2 0 01-2 2z" />
    ),
  },
  {
    title: 'Secure Account',
    desc: 'Your account is protected by Firebase Authentication, and sensitive data never touches your browser storage.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
  },
  {
    title: 'Transparent Loan Information',
    desc: 'See estimated APR, fees, and total repayment before you apply — no hidden terms.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />,
  },
  {
    title: 'Application Tracking',
    desc: 'Track your application status and any next steps from a single dashboard.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
  },
]

const HOW_IT_WORKS = [
  ['Tell us what you need', 'Choose a loan amount and term, and see estimated costs up front.'],
  ['Complete your application', 'Provide your details across a few short, guided steps.'],
  ['We review your request', 'Your application goes through eligibility checks and underwriting.'],
  ['Get your decision', 'Track status in your dashboard and complete any required next steps.'],
]

export default function Home() {
  return (
    <div>
      <Hero />

      <section className="container-page py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <Card key={b.title} className="transition hover:shadow-lifted">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  {b.icon}
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-navy-900">{b.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-navy-500">{b.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-navy-50/60 py-20">
        <div className="container-page">
          <div className="mb-10 max-w-xl">
            <h2 className="font-display text-3xl font-semibold text-navy-900">How it works</h2>
            <p className="mt-3 text-navy-500">
              A straightforward path from application to decision — with no surprises along the way.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map(([title, desc], i) => (
              <div key={title} className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 font-display text-sm font-semibold text-white">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-semibold text-navy-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-500">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Button as={Link} to="/how-it-works" variant="outline">See the full process</Button>
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="mb-10 max-w-xl">
          <h2 className="font-display text-3xl font-semibold text-navy-900">Estimate your loan</h2>
          <p className="mt-3 text-navy-500">
            Get a transparent estimate of costs before you apply. Figures are illustrative until your
            application is reviewed.
          </p>
        </div>
        <LoanCalculator />
      </section>

      <section className="bg-navy-50/60 py-20">
        <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="font-display text-3xl font-semibold text-navy-900">Why customers choose {BRAND.shortName}</h2>
            <ul className="mt-6 space-y-4">
              {[
                'Clear, upfront breakdown of fees and estimated APR before you apply.',
                'A dashboard where you can follow your application from submission to decision.',
                'A dedicated support team available for questions at any step.',
                'State-by-state availability so you always know if a loan is offered where you live.',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-navy-600">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4L8.5 12l6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Card className="bg-navy-900 text-white">
            <h3 className="font-display text-xl text-navy-600 font-semibold">Borrow responsibly</h3>
            <p className="mt-3 text-sm leading-relaxed text-navy-600">
              Short-term loans can be an expensive way to borrow money. Before applying, review the
              estimated APR, fees, and total repayment, and consider whether a short-term loan is the
              right choice for your situation.
            </p>
            <Button as={Link} to="/responsible-lending" variant="outline" className="mt-6 border-white/20 bg-transparent text-white hover:bg-white/10">
              Read our guidance
            </Button>
          </Card>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="font-display text-3xl font-semibold text-navy-900">Frequently asked questions</h2>
          <Link to="/faq" className="hidden text-sm font-medium text-accent-600 hover:text-accent-700 sm:block">
            View all FAQs &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[
            ['Does applying guarantee approval?', 'No. Submitting an application does not guarantee approval or funding. All requests are subject to eligibility, verification, underwriting, and applicable state law.'],
            ['How does the registration fee work?', 'A one-time registration fee may apply based on your requested loan amount. The fee amount is shown before you submit your application.'],
            ['Why does payment open another website?', 'Registration fee payments are processed by a separate, external payment provider for security. We never collect card details directly.'],
            ['Is my information secure?', 'Yes. Accounts are protected with Firebase Authentication, and sensitive information is never stored in your browser.'],
          ].map(([q, a]) => (
            <Card key={q}>
              <h3 className="font-semibold text-navy-900">{q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">{a}</p>
            </Card>
          ))}
        </div>
        <Link to="/faq" className="mt-6 block text-sm font-medium text-accent-600 hover:text-accent-700 sm:hidden">
          View all FAQs &rarr;
        </Link>
      </section>

      <section className="bg-navy-950 py-20">
        <div className="container-page text-center">
          <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            Ready to see your loan options?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-navy-300">
            Create your account and complete a short application — you can track every step from your dashboard.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button as={Link} to="/apply" variant="accent" size="lg">Check Loan Options</Button>
            <Button as={Link} to="/register" variant="outline" size="lg" className="border-white/20 bg-transparent text-white hover:bg-white/10">
              Create an account
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
