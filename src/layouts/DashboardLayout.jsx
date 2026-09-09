import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const LINKS = [
  ['/dashboard', 'Overview', true],
  ['/dashboard/applications', 'My Applications', false],
  ['/dashboard/notifications', 'Notifications', false],
  ['/dashboard/profile', 'Profile', false],
]

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-navy-50/40">
      <Navbar />
      <div className="container-page flex-1 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="flex gap-1 overflow-x-auto rounded-2xl bg-white p-2 shadow-card lg:flex-col lg:overflow-visible">
              {LINKS.map(([to, label, end]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                      isActive ? 'bg-navy-900 text-white' : 'text-navy-600 hover:bg-navy-50'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
