import React from 'react'
import { Link } from 'react-router-dom'
import Button from './ui/Button.jsx'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-950">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl" />

      <div className="container-page relative grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-brand-300">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            Online applications open in participating states
          </span>

          <h1 className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.08] text-white sm:text-5xl lg:text-[3.4rem]">
            Simple Short-Term Loan Applications
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-green-200">
            Submit your application online in minutes. Every request is reviewed
            for eligibility, verified, and subject to underwriting, applicable
            state law, and lender availability — we'll walk you through exactly
            what happens at each step.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button as={Link} to="/apply" variant="accent" size="lg">
              Check Loan Options
            </Button>
            <Button as={Link} to="/how-it-works" variant="outline" size="lg" className="border-white/20 bg-transparent text-white hover:bg-white/10">
              How It Works
            </Button>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {[
              ['14–30', 'day loan terms'],
              ['$100–$2K', 'requestable range'],
              ['5 min', 'to apply online'],
            ].map(([stat, label]) => (
              <div key={label}>
                <dt className="font-display text-2xl font-semibold text-white">{stat}</dt>
                <dd className="mt-1 text-xs text-green-200">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Illustrative application-status device mock — not a real customer record */}
        <div className="relative mx-auto w-full max-w-md lg:mx-0">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand-500/20 to-accent-500/10 blur-2xl" />
          <div className="relative rounded-2xl border border-white/10 bg-navy-900/80 p-5 shadow-lifted backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-green-300">Application QF-2026-104829</p>
              <span className="rounded-full bg-brand-500/15 px-2.5 py-1 text-xs font-semibold text-brand-400">Under Review</span>
            </div>

            <div className="mt-5 rounded-xl bg-white/5 p-4">
              <p className="text-xs text-green-200">Requested amount</p>
              <p className="mt-1 font-display text-3xl font-semibold text-white">$750.00</p>
              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-sm">
                <div>
                  <p className="text-xs text-green-200">Loan term</p>
                  <p className="font-medium text-white">21 days</p>
                </div>
                <div>
                  <p className="text-xs text-green-200">Registration fee</p>
                  <p className="font-medium text-white">$50.00</p>
                </div>
              </div>
            </div>

            <ul className="mt-5 space-y-3">
              {[
                ['Application submitted', true],
                ['Identity verification', true],
                ['Underwriting review', false],
                ['Decision & next steps', false],
              ].map(([step, done]) => (
                <li key={step} className="flex items-center gap-3 text-sm">
                  <span
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                      done ? 'bg-brand-500 text-navy-950' : 'border border-white/20 text-transparent'
                    }`}
                  >
                    <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor">
                      <path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4L8.5 12l6.8-6.8a1 1 0 011.4 0z" />
                    </svg>
                  </span>
                  <span className={done ? 'text-navy-200' : 'text-navy-400'}>{step}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[11px] leading-relaxed text-gray-400">
              Sample application shown for illustration. Actual status, terms, and
              fees are specific to your submitted application.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
