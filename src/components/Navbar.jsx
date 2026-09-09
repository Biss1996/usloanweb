import React, { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { logoutUser } from '../services/authService.jsx'
import { listNotifications, markNotificationRead } from '../services/notificationService.jsx'
import { BRAND } from '../config/constants.jsx'
import Button from './ui/Button.jsx'

const PUBLIC_LINKS = [
  ['/', 'Home'],
  ['/how-it-works', 'How It Works'],
  ['/loan-options', 'Loan Options'],
  ['/faq', 'FAQ'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
]

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-brand-400 transition-colors group-hover:bg-navy-800">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16.5 9 8l3 5.5 3-4L20 16.5" />
        </svg>
      </span>
      <span className="font-display text-lg font-semibold tracking-tight text-navy-900">
        {BRAND.name}
      </span>
    </Link>
  )
}

function NotificationBell() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    if (!user) return
    listNotifications(user.uid).then(setItems).catch(() => {})
  }, [user])

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const unreadCount = items.filter((n) => !n.read).length

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative rounded-full p-2 text-navy-500 hover:bg-navy-50 hover:text-navy-800"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-2xl border border-navy-100 bg-white p-2 shadow-lifted">
          <p className="px-3 py-2 text-sm font-semibold text-navy-800">Notifications</p>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-navy-400">You're all caught up.</p>
            )}
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  markNotificationRead(user.uid, n.id)
                  setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: true } : i)))
                }}
                className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-navy-50 ${!n.read ? 'bg-accent-50/60' : ''}`}
              >
                <p className="font-medium text-navy-800">{n.title}</p>
                <p className="mt-0.5 text-xs text-navy-500">{n.message}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const { user, profile, loading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logoutUser()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-navy-100 bg-white/90 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between">
        <Logo />

        <div className="hidden items-center gap-1 lg:flex">
          {PUBLIC_LINKS.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'text-navy-900' : 'text-navy-500 hover:text-navy-900'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {!loading && user ? (
            <>
              <NotificationBell />
              <Link to="/dashboard" className="text-sm font-medium text-navy-600 hover:text-navy-900">
                {profile?.firstName ? `Hi, ${profile.firstName}` : 'Dashboard'}
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-navy-600 hover:text-navy-900">Sign In</Link>
              <Button as={Link} to="/apply" variant="accent" size="sm">Check Loan Options</Button>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-navy-700 lg:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-navy-100 bg-white lg:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {PUBLIC_LINKS.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-50"
              >
                {label}
              </NavLink>
            ))}
            <div className="my-2 h-px bg-navy-100" />
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-50">Dashboard</Link>
                <Link to="/dashboard/applications" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-50">My Applications</Link>
                <Link to="/dashboard/notifications" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-50">Notifications</Link>
                <Link to="/dashboard/profile" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-50">Profile</Link>
                <button onClick={handleLogout} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-50">Sign In</Link>
                <Button as={Link} to="/apply" variant="accent" className="mt-1 w-full" onClick={() => setMobileOpen(false)}>Check Loan Options</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
