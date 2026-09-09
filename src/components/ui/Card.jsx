import React from 'react'

export default function Card({ className = '', padded = true, children, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-navy-100 bg-white shadow-card ${padded ? 'p-6' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
