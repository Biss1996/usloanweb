import React from 'react'
import { formatCurrency } from '../utils/formatters.jsx'

export default function LoanAmountSelector({ amounts, value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
      {amounts.map((amt) => {
        const active = Number(value) === amt
        return (
          <button
            key={amt}
            type="button"
            onClick={() => onChange(amt)}
            className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
              active
                ? 'border-navy-900 bg-navy-900 text-white shadow-card'
                : 'border-navy-200 bg-white text-navy-700 hover:border-navy-400'
            }`}
          >
            {formatCurrency(amt).replace('.00', '')}
          </button>
        )
      })}
    </div>
  )
}
