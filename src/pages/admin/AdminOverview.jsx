import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge.jsx'
import { listAllApplications } from '../../services/applicationService.jsx'
import { listAllUsers } from '../../services/adminService.jsx'
import { formatCurrency, formatDate } from '../../utils/formatters.jsx'
import { APPLICATION_STATUS, FEE_STATUS } from '../../config/constants.jsx'

export default function AdminOverview() {
  const [apps, setApps] = useState([])
  const [userCount, setUserCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([listAllApplications(), listAllUsers()])
      .then(([a, u]) => { setApps(a); setUserCount(u.length) })
      .finally(() => setLoading(false))
  }, [])

  const count = (pred) => apps.filter(pred).length
  const stats = [
    ['Total applications', apps.length],
    ['Submitted', count((a) => a.applicationStatus === APPLICATION_STATUS.SUBMITTED)],
    ['Under review', count((a) => a.applicationStatus === APPLICATION_STATUS.UNDER_REVIEW)],
    ['Approved', count((a) => a.applicationStatus === APPLICATION_STATUS.APPROVED)],
    ['Declined', count((a) => a.applicationStatus === APPLICATION_STATUS.DECLINED)],
    ['Payment required', count((a) => a.feeStatus === FEE_STATUS.PAYMENT_REQUIRED)],
    ['Payments verified', count((a) => a.feeStatus === FEE_STATUS.PAID)],
    ['Total users', userCount],
  ]

  if (loading) return <LoadingSpinner full label="Loading admin overview..." />

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">Overview</h1>
      <p className="mt-1 text-navy-500">A live snapshot across all applications and users.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <Card key={label} className="text-center">
            <p className="font-display text-2xl font-semibold text-navy-900">{value}</p>
            <p className="mt-1 text-xs text-navy-500">{label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-navy-900">Recent applications</h2>
        <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
              <tr>
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Submitted</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {apps.slice(0, 8).map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3.5 font-medium text-navy-900">{a.reference}</td>
                  <td className="px-5 py-3.5 text-navy-600">{formatCurrency(a.requestedAmount)}</td>
                  <td className="px-5 py-3.5"><ApplicationStatusBadge status={a.applicationStatus} /></td>
                  <td className="px-5 py-3.5 text-navy-600">{formatDate(a.submittedAt)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link to={`/admin/applications/${a.id}`} className="text-xs font-medium text-accent-600 hover:text-accent-700">Review</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
