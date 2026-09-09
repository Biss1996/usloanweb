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
      <div className="container-page py-8 sm:py-14">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/15 text-brand-400">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16.5 9 8l3 5.5 3-4L20 16.5" />
                </svg>
              </span>
              <span className="font-display text-lg font-semibold text-white">{BRAND.name}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-100">
              {BRAND.name} offers a simple online application for short-term loans.
              Submitting an application does not guarantee approval or funding; all loans
              are subject to eligibility, underwriting, verification, applicable state
              law, and lender availability.
            </p>
            <p className="mt-4 text-sm font-medium text-brand-300">
              {BRAND.supportEmail} &middot; {BRAND.supportPhone}
            </p>
          </div>

          {/* Mobile (below sm): compact collapsible sections to keep the footer short */}
          <div className="space-y-1 sm:hidden">
            {COLUMNS.map((col) => (
              <details key={col.title} className="group border-b border-white/10 py-2">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-white">
                  {col.title}
                  <svg
                    className="h-4 w-4 text-brand-400 transition-transform group-open:rotate-180"
                    viewBox="0 0 20 20" fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </summary>
                <ul className="mt-2 space-y-2 pb-1">
                  {col.links.map(([to, label]) => (
                    <li key={to}>
                      <Link to={to} className="text-sm text-navy-300 transition hover:text-brand-300">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>

          {/* sm and up: full always-visible columns */}
          {COLUMNS.map((col) => (
            <div key={col.title} className="hidden sm:block">
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

        <div className="mt-8 border-t border-white/10 pt-5 text-xs leading-relaxed text-navy-400 sm:mt-12 sm:pt-6">
          {/* Mobile: short disclaimer with a link to the full text */}
          <p className="sm:hidden">
            {BRAND.name} is a fictional demonstration brand and does not guarantee approval or
            funding.{' '}
            <Link to="/responsible-lending" className="font-medium text-brand-300 underline">
              Read our full disclosures
            </Link>
          </p>
          {/* sm and up: full disclaimer text */}
          <p className="hidden sm:block">
            {BRAND.name} is a fictional demonstration brand. This site does not represent an
            actual licensed lender. Availability of loan products varies by state and is
            subject to change. {BRAND.name} does not guarantee approval, funding amounts, or
            loan terms. Short-term loans are generally a high-cost form of credit and should
            be considered carefully — see our
            {' '}<Link to="/responsible-lending" className="text-brand-300 underline hover:text-brand-200">Responsible Borrowing</Link>{' '}
            page for more information.
          </p>
          <p className="mt-3">&copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}