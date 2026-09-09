import React from 'react'
import { Link } from 'react-router-dom'
import { BRAND } from '../config/constants.jsx'

const COLUMNS = [
  {
    title: 'Company',
    links: [['/about', 'About'], ['/how-it-works', 'How It Works'], ['/contact', 'Contact']],
  },
  {
    title: 'Loans',
    links: [['/loan-options', 'Loan Options'], ['/apply', 'Check Loan Options'], ['/faq', 'FAQ']],
  },
  {
    title: 'Legal',
    links: [
      ['/terms', 'Terms of Use'],
      ['/privacy', 'Privacy Policy'],
      ['/disclosures', 'Disclosures'],
      ['/e-sign-consent', 'E-Sign Consent'],
      ['/responsible-lending', 'Responsible Borrowing'],
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-navy-100 bg-navy-950 text-navy-200">
      <div className="container-page py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-brand-400">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16.5 9 8l3 5.5 3-4L20 16.5" />
                </svg>
              </span>
              <span className="font-display text-lg font-semibold text-white">{BRAND.name}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-300">
              {BRAND.name} offers a simple online application for short-term loans.
              Submitting an application does not guarantee approval or funding; all loans
              are subject to eligibility, underwriting, verification, applicable state
              law, and lender availability.
            </p>
            <p className="mt-4 text-sm text-navy-400">
              {BRAND.supportEmail} &middot; {BRAND.supportPhone}
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([to, label]) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-navy-300 transition hover:text-brand-300">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-xs leading-relaxed text-navy-400">
          <p>
            {BRAND.name} is a fictional demonstration brand. This site does not represent an
            actual licensed lender. Availability of loan products varies by state and is
            subject to change. {BRAND.name} does not guarantee approval, funding amounts, or
            loan terms. Short-term loans are generally a high-cost form of credit and should
            be considered carefully — see our
            {' '}<Link to="/responsible-lending" className="underline hover:text-brand-300">Responsible Borrowing</Link>{' '}
            page for more information.
          </p>
          <p className="mt-3">&copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
