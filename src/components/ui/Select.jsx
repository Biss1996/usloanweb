import React from 'react'

export default function Select({ label, error, id, options = [], className = '', required, placeholder, ...props }) {
  const inputId = id || props.name
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-navy-800">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={inputId}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-navy-900 transition focus:outline-none focus:ring-2 ${
          error ? 'border-red-300 focus:ring-red-400' : 'border-navy-200 focus:border-accent-500 focus:ring-accent-200'
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) =>
          Array.isArray(opt) ? (
            <option key={opt[0]} value={opt[0]}>{opt[1]}</option>
          ) : (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          )
        )}
      </select>
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}
