import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card.jsx'
import Select from '../../components/ui/Select.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge.jsx'
import PaymentStatusBadge from '../../components/PaymentStatusBadge.jsx'
import Button from '../../components/ui/Button.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { listUserApplications } from '../../services/applicationService.jsx'
import { formatCurrency, formatDate } from '../../utils/formatters.jsx'
import { APPLICATION_STATUS } from '../../config/constants.jsx'

const FILTERS = [
  ['all', 'All'], ['submitted', 'Submitted'], ['under_review', 'Under Review'],
  ['approved', 'Approved'], ['declined', 'Declined'], ['payment_required', 'Payment Required'],
]
const SORTS = [['newest', 'Newest'], ['oldest', 'Oldest'], ['amount', 'Loan Amount']]

export default function Applications() {
  const { user } = useAuth()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    if (!user) return
    listUserApplications(user.uid).then(setApps).catch(() => setApps([])).finally(() => setLoading(false))
  }, [user])

  const filtered = useMemo(() => {
    let list = [...apps]
    if (filter === 'payment_required') list = list.filter((a) => a.feeStatus === 'payment_required')
    else if (filter !== 'all') list = list.filter((a) => a.applicationStatus === filter)

    if (sort === 'oldest') list.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
    else if (sort === 'amount') list.sort((a, b) => b.requestedAmount - a.requestedAmount)
    else list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    return list
  }, [apps, filter, sort])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">My applications</h1>
          <p className="mt-1 text-navy-500">View and track every application you've submitted.</p>
        </div>
        <Button as={Link} to="/apply" variant="accent" size="sm">New application</Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Select className="w-44" options={FILTERS} value={filter} onChange={(e) => setFilter(e.target.value)} />
        <Select className="w-44" options={SORTS} value={sort} onChange={(e) => setSort(e.target.value)} />
      </div>

      <div className="mt-6">
        {loading ? (
          <Card className="flex justify-center py-12"><LoadingSpinner /></Card>
        ) : filtered.length === 0 ? (
          <EmptyState title="No applications match this filter" description="Try a different filter, or start a new application." />
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => (
              <Card key={a.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-navy-900">{a.reference}</p>
                  <p className="text-sm text-navy-500">{formatCurrency(a.requestedAmount)} &middot; Submitted {formatDate(a.submittedAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <ApplicationStatusBadge status={a.applicationStatus} />
                  <PaymentStatusBadge status={a.feeStatus} />
                  <Link to={`/dashboard/application/${a.id}`} className="text-sm font-medium text-accent-600 hover:text-accent-700">View &rarr;</Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
