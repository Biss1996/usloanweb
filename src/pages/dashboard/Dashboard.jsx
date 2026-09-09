import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge.jsx'
import PaymentStatusBadge from '../../components/PaymentStatusBadge.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { listUserApplications } from '../../services/applicationService.jsx'
import { formatCurrency, formatDate } from '../../utils/formatters.jsx'
import { APPLICATION_STATUS, FEE_STATUS } from '../../config/constants.jsx'

export default function Dashboard() {
  const { profile, user } = useAuth()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    listUserApplications(user.uid).then(setApps).catch(() => setApps([])).finally(() => setLoading(false))
  }, [user])

  const summary = {
    active: apps.filter((a) => ![APPLICATION_STATUS.DECLINED, APPLICATION_STATUS.CANCELLED].includes(a.applicationStatus)).length,
    underReview: apps.filter((a) => a.applicationStatus === APPLICATION_STATUS.UNDER_REVIEW).length,
    approved: apps.filter((a) => a.applicationStatus === APPLICATION_STATUS.APPROVED).length,
    paymentRequired: apps.filter((a) => a.feeStatus === FEE_STATUS.PAYMENT_REQUIRED).length,
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">
        Welcome{profile?.firstName ? `, ${profile.firstName}` : ''}
      </h1>
      <p className="mt-1 text-navy-500">Here's a snapshot of your loan applications.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['Active applications', summary.active],
          ['Under review', summary.underReview],
          ['Approved', summary.approved],
          ['Payments required', summary.paymentRequired],
        ].map(([label, value]) => (
          <Card key={label} className="text-center">
            <p className="font-display text-3xl font-semibold text-navy-900">{value}</p>
            <p className="mt-1 text-xs text-navy-500">{label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy-900">Recent applications</h2>
          <Button as={Link} to="/apply" variant="accent" size="sm">New application</Button>
        </div>

        {loading ? (
          <Card className="flex justify-center py-12"><LoadingSpinner /></Card>
        ) : apps.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Start your first application to see your loan options."
            action={<Button as={Link} to="/apply" variant="accent">Check Loan Options</Button>}
          />
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card sm:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Reference</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Submitted</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Fee</th>
                    <th className="px-5 py-3 font-medium">Payment</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {apps.slice(0, 6).map((a) => (
                    <tr key={a.id}>
                      <td className="px-5 py-3.5 font-medium text-navy-900">{a.reference}</td>
                      <td className="px-5 py-3.5 text-navy-600">{formatCurrency(a.requestedAmount)}</td>
                      <td className="px-5 py-3.5 text-navy-600">{formatDate(a.submittedAt)}</td>
                      <td className="px-5 py-3.5"><ApplicationStatusBadge status={a.applicationStatus} /></td>
                      <td className="px-5 py-3.5 text-navy-600">{formatCurrency(a.feeAmount)}</td>
                      <td className="px-5 py-3.5"><PaymentStatusBadge status={a.feeStatus} /></td>
                      <td className="px-5 py-3.5 text-right">
                        <Link to={`/dashboard/application/${a.id}`} className="text-xs font-medium text-accent-600 hover:text-accent-700">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 sm:hidden">
              {apps.slice(0, 6).map((a) => (
                <Card key={a.id}>
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-navy-900">{a.reference}</p>
                    <ApplicationStatusBadge status={a.applicationStatus} />
                  </div>
                  <p className="mt-2 text-sm text-navy-500">{formatCurrency(a.requestedAmount)} &middot; {formatDate(a.submittedAt)}</p>
                  <div className="mt-2"><PaymentStatusBadge status={a.feeStatus} /></div>
                  <Link to={`/dashboard/application/${a.id}`} className="mt-3 block text-sm font-medium text-accent-600">View application &rarr;</Link>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
