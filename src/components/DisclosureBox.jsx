import React from 'react'

export default function DisclosureBox({ title = 'Important disclosures', children }) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-navy-50/60 p-5 text-sm text-navy-600">
      <p className="mb-2 font-semibold text-navy-800">{title}</p>
      <div className="space-y-2 leading-relaxed">{children}</div>
    </div>
  )
}
