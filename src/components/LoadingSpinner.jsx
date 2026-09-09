import React from 'react'

export default function LoadingSpinner({ label = 'Loading', size = 'md', full = false }) {
  const px = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-10 w-10' : 'h-6 w-6'
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 text-navy-500">
      <svg className={`${px} animate-spin text-brand-600`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  )
  if (full) {
    return <div className="flex min-h-[40vh] items-center justify-center">{content}</div>
  }
  return content
}
