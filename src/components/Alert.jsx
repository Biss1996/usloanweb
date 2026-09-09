import React from 'react'

const STYLES = {
  info: { wrap: 'bg-accent-50 border-accent-200 text-accent-900', icon: 'text-accent-600' },
  success: { wrap: 'bg-brand-50 border-brand-200 text-brand-900', icon: 'text-brand-600' },
  warning: { wrap: 'bg-amber-50 border-amber-200 text-amber-900', icon: 'text-amber-600' },
  error: { wrap: 'bg-red-50 border-red-200 text-red-900', icon: 'text-red-600' },
}

export default function Alert({ type = 'info', title, children, className = '' }) {
  const style = STYLES[type] || STYLES.info
  return (
    <div role="alert" className={`flex gap-3 rounded-xl border p-4 text-sm ${style.wrap} ${className}`}>
      <svg className={`mt-0.5 h-5 w-5 flex-shrink-0 ${style.icon}`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10A8 8 0 112 10a8 8 0 0116 0zM9 6a1 1 0 112 0v4a1 1 0 11-2 0V6zm1 8a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 14z" clipRule="evenodd" />
      </svg>
      <div>
        {title && <p className="mb-0.5 font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  )
}
