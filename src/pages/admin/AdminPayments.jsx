import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card.jsx'
import Select from '../../components/ui/Select.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import PaymentStatusBadge from '../../components/PaymentStatusBadge.jsx'
import { listAllApplications } from '../../services/applicationService.jsx'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters.jsx'
import { FEE_STATUS } from '../../config/constants.jsx'

export default function AdminPayments() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    listAllApplications().then(setApps).catch(() => setApps([])).finally(() => setLoading(false))
  }, [])

  const payable = useMemo(
    () => apps.filter((a) => a.feeAmount > 0 || a.feeStatus !== FEE_STATUS.NOT_REQUIRED),
    [apps]
  )

  const filtered = useMemo(
    () => (filter ? payable.filter((a) => a.feeStatus === filter) : payable),
    [payable, filter]
  )

  const totals = useMemo(() => {
    const paid = apps.filter((a) => a.feeStatus === FEE_STATUS.PAID)
    return {
      paidCount: paid.length,
      paidAmount: paid.reduce((sum, a) => sum + (a.feeAmount || 0), 0),
      pendingCount: apps.filter((a) => a.feeStatus === FEE_STATUS.PAYMENT_REQUIRED).length,
    }
  }, [apps])

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">Payments</h1>
      <p className="mt-1 text-navy-500">Registration fee status across all applications.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <p className="font-display text-2xl font-semibold text-navy-900">{totals.paidCount}</p>
          <p className="mt-1 text-xs text-navy-500">Payments verified</p>
        </Card>
        <Card className="text-center">
          <p className="font-display text-2xl font-semibold text-navy-900">{formatCurrency(totals.paidAmount)}</p>
          <p className="mt-1 text-xs text-navy-500">Total verified amount</p>
        </Card>
        <Card className="text-center">
          <p className="font-display text-2xl font-semibold text-navy-900">{totals.pendingCount}</p>
          <p className="mt-1 text-xs text-navy-500">Awaiting payment</p>
        </Card>
      </div>

      <Select
        className="mt-6 w-56" placeholder="All payment statuses" value={filter} onChange={(e) => setFilter(e.target.value)}
        options={Object.values(FEE_STATUS).map((s) => [s, s.replace(/_/g, ' ')])}
      />

      <div className="mt-6">
        {loading ? (
          <Card className="flex justify-center py-12"><LoadingSpinner /></Card>
        ) : filtered.length === 0 ? (
          <EmptyState title="No matching payments" description="Try a different filter." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 font-medium">Applicant</th>
                  <th className="px-5 py-3 font-medium">Fee</th>
                  <th className="px-5 py-3 font-medium">Payment status</th>
                  <th className="px-5 py-3 font-medium">Verified</th>
                  <th className="px-5 py-3 font-medium">Submitted</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td className="px-5 py-3.5 font-medium text-navy-900">{a.reference}</td>
                    <td className="px-5 py-3.5 text-navy-600">{a.applicant?.firstName} {a.applicant?.lastName}</td>
                    <td className="px-5 py-3.5 text-navy-600">{formatCurrency(a.feeAmount)}</td>
                    <td className="px-5 py-3.5"><PaymentStatusBadge status={a.feeStatus} /></td>
                    <td className="px-5 py-3.5 text-navy-600">{a.feeVerifiedAt ? formatDateTime(a.feeVerifiedAt) : '—'}</td>
                    <td className="px-5 py-3.5 text-navy-600">{formatDate(a.submittedAt)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Link to={`/admin/applications/${a.id}`} className="text-xs font-medium text-accent-600 hover:text-accent-700">Manage</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
