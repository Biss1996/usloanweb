import React from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { formatDate, titleCase } from '../../utils/formatters.jsx'
import { BRAND } from '../../config/constants.jsx'

// Profile information is captured once at registration and displayed
// read-only here. It intentionally cannot be edited from this screen —
// changes to identity details (name, phone, state) require verification,
// so customers are directed to contact support instead.

export default function Profile() {
  const { profile, loading } = useAuth()

  if (loading || !profile) {
    return <LoadingSpinner full label="Loading your profile..." />
  }

  const fields = [
    ['First name', profile.firstName],
    ['Last name', profile.lastName],
    ['Email', profile.email],
    ['Phone', profile.phone],
    ['State', profile.state],
  ]

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">Profile</h1>
      <p className="mt-1 text-navy-500">
        This is the information you provided when you created your account.
      </p>

      <Card className="mt-6 max-w-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-navy-900">{profile.firstName} {profile.lastName}</p>
            <p className="text-sm text-navy-500">Member since {formatDate(profile.createdAt)}</p>
          </div>
          <Badge tone={profile.accountStatus === 'active' ? 'success' : 'neutral'}>
            {titleCase(profile.accountStatus)}
          </Badge>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-5 border-t border-navy-100 pt-6 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-navy-400">{label}</dt>
              <dd className="mt-1 text-sm font-medium text-navy-800">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="mt-4 max-w-xl bg-navy-50/60">
        <p className="text-sm text-navy-600">
          To update your name, phone number, or state, please{' '}
          <Link to="/contact" className="font-medium text-accent-600 hover:text-accent-700">contact support</Link>
          {' '}— we verify identity details before changing them on an account.
        </p>
        <p className="mt-2 text-xs text-navy-400">Support: {BRAND.supportEmail} &middot; {BRAND.supportPhone}</p>
      </Card>
    </div>
  )
}