import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge.jsx'
import PaymentStatusBadge from '../../components/PaymentStatusBadge.jsx'
import { listAllApplications } from '../../services/applicationService.jsx'
import { formatCurrency, formatDate } from '../../utils/formatters.jsx'
import { APPLICATION_STATUS, FEE_STATUS } from '../../config/constants.jsx'

export default function AdminApplications() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [feeFilter, setFeeFilter] = useState('')

  useEffect(() => {
    listAllApplications().then(setApps).catch(() => setApps([])).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      if (statusFilter && a.applicationStatus !== statusFilter) return false
      if (feeFilter && a.feeStatus !== feeFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const hay = `${a.reference} ${a.applicant?.firstName} ${a.applicant?.lastName} ${a.applicant?.email}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [apps, search, statusFilter, feeFilter])

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">Applications</h1>
      <p className="mt-1 text-navy-500">Search, filter, and review every submitted application.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Input className="w-64" placeholder="Search by reference, name, or email" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select
          className="w-48" placeholder="All statuses" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          options={Object.values(APPLICATION_STATUS).map((s) => [s, s.replace(/_/g, ' ')])}
        />
        <Select
          className="w-48" placeholder="All payment statuses" value={feeFilter} onChange={(e) => setFeeFilter(e.target.value)}
          options={Object.values(FEE_STATUS).map((s) => [s, s.replace(/_/g, ' ')])}
        />
      </div>

      <div className="mt-6">
        {loading ? (
          <Card className="flex justify-center py-12"><LoadingSpinner /></Card>
        ) : filtered.length === 0 ? (
          <EmptyState title="No applications found" description="Try adjusting your search or filters." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 font-medium">Applicant</th>
                  <th className="px-5 py-3 font-medium">State</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Fee</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Submitted</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td className="px-5 py-3.5 font-medium text-navy-900">{a.reference}</td>
                    <td className="px-5 py-3.5 text-navy-600">{a.applicant?.firstName} {a.applicant?.lastName}</td>
                    <td className="px-5 py-3.5 text-navy-600">{a.address?.state}</td>
                    <td className="px-5 py-3.5 text-navy-600">{formatCurrency(a.requestedAmount)}</td>
                    <td className="px-5 py-3.5 text-navy-600">{formatCurrency(a.feeAmount)}</td>
                    <td className="px-5 py-3.5"><PaymentStatusBadge status={a.feeStatus} /></td>
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
        )}
      </div>
    </div>
  )
}
