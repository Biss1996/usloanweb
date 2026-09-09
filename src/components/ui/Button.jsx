import React from 'react'

const VARIANTS = {
  primary: 'bg-navy-900 text-white hover:bg-navy-800 focus-visible:ring-navy-900',
  accent: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-600',
  outline: 'border border-navy-200 text-navy-900 bg-white hover:bg-navy-50 focus-visible:ring-navy-300',
  ghost: 'text-navy-700 hover:bg-navy-50 focus-visible:ring-navy-200',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
}

const SIZES = {
  sm: 'text-sm px-3 py-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 rounded-xl',
  lg: 'text-base px-6 py-3.5 rounded-xl',
}

export default function Button({
  as: As = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  children,
  ...props
}) {
  return (
    <As
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </As>
  )
}
