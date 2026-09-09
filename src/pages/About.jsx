import React from 'react'
import Card from '../components/ui/Card.jsx'
import { BRAND } from '../config/constants.jsx'

export default function About() {
  return (
    <div className="container-page py-16">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold text-navy-900">About {BRAND.name}</h1>
        <p className="mt-4 text-lg text-navy-500">
          We built {BRAND.name} to make short-term loan applications simple, transparent, and easy
          to track from start to finish.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          ['Transparency first', 'Every fee and estimated cost is shown before you apply — never buried in fine print.'],
          ['Built for clarity', 'A guided application and a dashboard that always shows exactly where things stand.'],
          ['Security by design', 'Sensitive data is never stored where it does not belong, and every protected action is verified server-side.'],
        ].map(([title, desc]) => (
          <Card key={title}>
            <h3 className="font-semibold text-navy-900">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-500">{desc}</p>
          </Card>
        ))}
      </div>

      <div className="prose prose-sm mt-14 max-w-2xl text-navy-600">
        <h2 className="font-display text-2xl font-semibold text-navy-900">Our approach</h2>
        <p className="mt-3 leading-relaxed">
          {BRAND.name} is a demonstration lending platform focused on getting the fundamentals
          right: clear communication, honest disclosures, and a product that treats applicants
          with respect. We do not promise guaranteed approval or funding — every application is
          reviewed individually, in line with applicable law and responsible lending practices.
        </p>
      </div>
    </div>
  )
}
