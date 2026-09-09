import React from 'react'

export default function Input({ label, error, id, className = '', required, hint, ...props }) {
  const inputId = id || props.name
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-navy-800">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 transition focus:outline-none focus:ring-2 focus:ring-offset-0 ${
          error
            ? 'border-red-300 focus:ring-red-400'
            : 'border-navy-200 focus:border-accent-500 focus:ring-accent-200'
        } ${className}`}
        {...props}
      />
      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-navy-500">{hint}</p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  )
}
