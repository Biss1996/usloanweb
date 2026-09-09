import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Alert from '../../components/Alert.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import ConfirmModal from '../../components/ConfirmModal.jsx'
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge.jsx'
import PaymentStatusBadge from '../../components/PaymentStatusBadge.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { getApplication, updateApplicationStatus } from '../../services/applicationService.jsx'
import { markPaymentVerified, markPaymentRefunded, waiveFee } from '../../services/paymentService.jsx'
import { formatCurrency, formatDate, formatDateTime, titleCase } from '../../utils/formatters.jsx'
import { APPLICATION_STATUS } from '../../config/constants.jsx'

const STATUS_ACTIONS = [
  ['Mark Under Review', APPLICATION_STATUS.UNDER_REVIEW],
  ['Request Additional Information', APPLICATION_STATUS.ADDITIONAL_INFO],
  ['Approve', APPLICATION_STATUS.APPROVED],
  ['Decline', APPLICATION_STATUS.DECLINED],
  ['Cancel', APPLICATION_STATUS.CANCELLED],
]

export default function AdminApplicationDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pendingAction, setPendingAction] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const load = () => getApplication(id).then(setApp).finally(() => setLoading(false))
  useEffect(() => { load() }, [id])

  const runAction = async () => {
    if (!pendingAction) return
    setActionLoading(true)
    try {
      if (pendingAction.type === 'status') {
        await updateApplicationStatus(id, pendingAction.value, user.uid)
      } else if (pendingAction.type === 'payment_verified') {
        await markPaymentVerified(id, user.uid)
      } else if (pendingAction.type === 'payment_refunded') {
        await markPaymentRefunded(id, user.uid)
      } else if (pendingAction.type === 'waive_fee') {
        await waiveFee(id, user.uid)
      }
      setMessage({ type: 'success', text: 'Action completed and recorded in the audit log.' })
      await load()
    } catch (err) {
      setMessage({ type: 'error', text: 'This action could not be completed. Please try again.' })
    } finally {
      setActionLoading(false)
      setPendingAction(null)
    }
  }

  if (loading) return <LoadingSpinner full label="Loading application..." />
  if (!app) return <Alert type="error" title="Not found">This application could not be found.</Alert>

  return (
    <div>
      <Link to="/admin/applications" className="text-sm font-medium text-accent-600 hover:text-accent-700">&larr; Back to applications</Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">{app.reference}</h1>
          <p className="mt-1 text-navy-500">{app.applicant?.firstName} {app.applicant?.lastName} &middot; {app.applicant?.email}</p>
        </div>
        <div className="flex gap-2">
          <ApplicationStatusBadge status={app.applicationStatus} />
          <PaymentStatusBadge status={app.feeStatus} />
        </div>
      </div>

      {message && <Alert type={message.type} className="mt-4">{message.text}</Alert>}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="font-semibold text-navy-900">Loan request</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Row label="Amount" value={formatCurrency(app.requestedAmount)} />
              <Row label="Term" value={`${app.loanTerm} days`} />
              <Row label="Purpose" value={titleCase(app.loanPurpose)} />
            </dl>
          </Card>

          <Card>
            <h2 className="font-semibold text-navy-900">Employment</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Row label="Status" value={titleCase(app.employment?.status)} />
              <Row label="Employer" value={app.employment?.employerName} />
              <Row label="Monthly income" value={formatCurrency(app.employment?.monthlyIncome)} />
            </dl>
          </Card>

          <Card>
            <h2 className="font-semibold text-navy-900">Financial overview</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Row label="Monthly income" value={formatCurrency(app.financials?.monthlyIncome)} />
              <Row label="Housing expense" value={formatCurrency(app.financials?.monthlyHousingExpense)} />
              <Row label="Est. monthly expenses" value={formatCurrency(app.financials?.estimatedMonthlyExpenses)} />
            </dl>
          </Card>

          <Card>
            <h2 className="font-semibold text-navy-900">Timeline</h2>
            <ul className="mt-4 space-y-4">
              {(app.timeline || []).map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                  <div>
                    <p className="text-sm font-medium text-navy-800">{titleCase(t.event)}</p>
                    <p className="text-xs text-navy-400">{formatDateTime(t.at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold text-navy-900">Application status</h2>
            <div className="mt-4 flex flex-col gap-2">
              {STATUS_ACTIONS.map(([label, value]) => (
                <Button
                  key={value}
                  variant={value === APPLICATION_STATUS.DECLINED || value === APPLICATION_STATUS.CANCELLED ? 'outline' : 'primary'}
                  size="sm"
                  disabled={app.applicationStatus === value}
                  onClick={() => setPendingAction({ type: 'status', value, label })}
                >
                  {label}
                </Button>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-navy-900">Registration fee</h2>
            <p className="mt-2 font-display text-2xl font-semibold text-navy-900">{formatCurrency(app.feeAmount)}</p>
            <div className="mt-2"><PaymentStatusBadge status={app.feeStatus} /></div>
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="accent" size="sm" onClick={() => setPendingAction({ type: 'payment_verified', label: 'Mark Payment Verified' })}>
                Mark Payment Verified
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPendingAction({ type: 'payment_refunded', label: 'Mark Payment Refunded' })}>
                Mark Payment Refunded
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPendingAction({ type: 'waive_fee', label: 'Waive Fee' })}>
                Waive Fee
              </Button>
            </div>
            <p className="mt-3 text-xs text-navy-400">
              Verifying payment never changes the application status — underwriting stays independent.
            </p>
          </Card>

          <Card className="bg-navy-50/60">
            <h2 className="font-semibold text-navy-900">Submission details</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Submitted" value={formatDate(app.submittedAt)} />
              <Row label="Last updated" value={formatDateTime(app.updatedAt)} />
              <Row label="User ID" value={app.userId} />
            </dl>
          </Card>
        </div>
      </div>

      <ConfirmModal
        open={Boolean(pendingAction)}
        title={pendingAction?.label}
        description="This action will be recorded in the audit log and cannot be undone from this screen. Are you sure you want to continue?"
        onConfirm={runAction}
        onCancel={() => setPendingAction(null)}
        loading={actionLoading}
      />
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-navy-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-navy-800">{value || '—'}</dd>
    </div>
  )
}
