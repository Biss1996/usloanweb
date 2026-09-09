import React from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { logoutUser } from '../services/authService.jsx'
import { BRAND } from '../config/constants.jsx'

const LINKS = [
  ['/admin', 'Overview', true],
  ['/admin/applications', 'Applications', false],
  ['/admin/users', 'Users', false],
  ['/admin/payments', 'Payments', false],
  ['/admin/payment-links', 'Payment Links', false],
  ['/admin/settings/loans', 'Loan Configuration', false],
  ['/admin/states', 'States', false],
  ['/admin/contact-messages', 'Contact Messages', false],
  ['/admin/audit-logs', 'Audit Logs', false],
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const handleLogout = async () => {
    await logoutUser()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-navy-50/40">
      <aside className="hidden w-64 flex-shrink-0 border-r border-navy-100 bg-navy-950 text-navy-200 lg:flex lg:flex-col">
        <Link to="/admin" className="flex items-center gap-2 px-6 py-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-brand-400">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16.5 9 8l3 5.5 3-4L20 16.5" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-white">{BRAND.name}</p>
            <p className="text-[11px] text-navy-400">Admin Console</p>
          </div>
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          {LINKS.map(([to, label, end]) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `block rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-white/10 text-white' : 'text-navy-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <button onClick={handleLogout} className="w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-navy-300 hover:bg-white/5 hover:text-white">
            Sign out
          </button>
          <Link to="/" className="mt-1 block rounded-xl px-3.5 py-2.5 text-sm font-medium text-navy-400 hover:bg-white/5 hover:text-white">
            &larr; Back to site
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-navy-100 bg-white px-4 py-3 lg:hidden">
          <span className="font-display text-base font-semibold text-navy-900">Admin Console</span>
          <button onClick={handleLogout} className="text-sm font-medium text-navy-500">Sign out</button>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
