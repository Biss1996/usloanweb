import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Alert from '../../components/Alert.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge.jsx'
import PaymentStatusBadge from '../../components/PaymentStatusBadge.jsx'
import { getApplication } from '../../services/applicationService.jsx'
import { redirectToPayment } from '../../services/paymentService.jsx'
import { formatCurrency, formatDate, formatDateTime, titleCase } from '../../utils/formatters.jsx'
import { FEE_STATUS } from '../../config/constants.jsx'

export default function ApplicationDetail() {
  const { id } = useParams()
  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [payError, setPayError] = useState('')
  const [payLoading, setPayLoading] = useState(false)

  useEffect(() => {
    getApplication(id).then(setApp).finally(() => setLoading(false))
  }, [id])

  const handlePay = async () => {
    setPayError('')
    setPayLoading(true)
    try {
      await redirectToPayment(id)
    } catch (err) {
      setPayError(err.message || 'Online payment is currently unavailable. Please check again later or contact support.')
      setPayLoading(false)
    }
  }

  if (loading) return <div className="py-16"><LoadingSpinner full label="Loading application..." /></div>
  if (!app) return <Alert type="error" title="Application not found">We couldn't find that application.</Alert>

  return (
    <div>
      <Link to="/dashboard/applications" className="text-sm font-medium text-accent-600 hover:text-accent-700">&larr; Back to applications</Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">{app.reference}</h1>
          <p className="mt-1 text-navy-500">Submitted {formatDate(app.submittedAt)}</p>
        </div>
        <div className="flex gap-2">
          <ApplicationStatusBadge status={app.applicationStatus} />
          <PaymentStatusBadge status={app.feeStatus} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="font-semibold text-navy-900">Loan information</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Row label="Requested amount" value={formatCurrency(app.requestedAmount)} />
              <Row label="Loan term" value={`${app.loanTerm} days`} />
              <Row label="Purpose" value={titleCase(app.loanPurpose)} />
            </dl>
          </Card>

          <Card>
            <h2 className="font-semibold text-navy-900">Applicant information</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Row label="Name" value={`${app.applicant?.firstName} ${app.applicant?.lastName}`} />
              <Row label="Email" value={app.applicant?.email} />
              <Row label="Phone" value={app.applicant?.phone} />
              <Row label="Address" value={`${app.address?.city}, ${app.address?.state} ${app.address?.zip}`} />
            </dl>
          </Card>

          <Card>
            <h2 className="font-semibold text-navy-900">Application timeline</h2>
            <ul className="mt-4 space-y-4">
              {(app.timeline || []).map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                  <div>
                    <p className="text-sm font-medium text-navy-800">{titleCase(t.event)}</p>
                    <p className="text-xs text-navy-400">{formatDateTime(t.at)}</p>
                    {t.note && <p className="mt-0.5 text-sm text-navy-500">{t.note}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold text-navy-900">Registration fee</h2>
            <p className="mt-2 font-display text-3xl font-semibold text-navy-900">{formatCurrency(app.feeAmount)}</p>
            <div className="mt-2"><PaymentStatusBadge status={app.feeStatus} /></div>

            {payError && <Alert type="warning" className="mt-4">{payError}</Alert>}

            {app.feeStatus === FEE_STATUS.PAYMENT_REQUIRED && (
              <Button variant="accent" className="mt-4 w-full" onClick={handlePay} loading={payLoading}>
                Pay Registration Fee
              </Button>
            )}
            {app.feeStatus === FEE_STATUS.PAID && (
              <Alert type="success" className="mt-4">Payment Verified</Alert>
            )}
            {app.feeStatus === FEE_STATUS.VERIFICATION_PENDING && (
              <Alert type="info" className="mt-4">Your payment is being verified. This can take a short while.</Alert>
            )}
            {(app.feeStatus === FEE_STATUS.NOT_REQUIRED || app.feeStatus === FEE_STATUS.WAIVED) && (
              <Alert type="info" className="mt-4">No payment is required for this application.</Alert>
            )}
          </Card>

          <Card className="bg-navy-50/60">
            <h2 className="font-semibold text-navy-900">Need help?</h2>
            <p className="mt-2 text-sm text-navy-500">
              If you have questions about your application or payment, our support team is happy to help.
            </p>
            <Button as={Link} to="/contact" variant="outline" className="mt-4 w-full">Contact support</Button>
          </Card>
        </div>
      </div>
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
