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
import { uploadPaymentProof } from '../../services/paymentProofService.jsx'

import {
  formatCurrency,
  formatDate,
  formatDateTime,
  titleCase,
} from '../../utils/formatters.jsx'

import { FEE_STATUS } from '../../config/constants.jsx'

export default function ApplicationDetail() {
  const { id } = useParams()

  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [payError, setPayError] = useState('')
  const [payLoading, setPayLoading] = useState(false)

  const [receiptFile, setReceiptFile] = useState(null)
  const [receiptLoading, setReceiptLoading] = useState(false)
  const [receiptError, setReceiptError] = useState('')
  const [receiptSuccess, setReceiptSuccess] = useState('')

  useEffect(() => {
    let active = true

    setLoading(true)
    setLoadError('')
    setApp(null)

    getApplication(id)
      .then((application) => {
        if (active) {
          setApp(application ? { ...application, id } : null)
        }
      })
      .catch((error) => {
        console.error('Failed to load application:', error)

        if (active) {
          setLoadError('Could not load this application. Please try again.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  const handlePay = async () => {
    setPayError('')
    setPayLoading(true)

    try {
      await redirectToPayment(id)
    } catch (error) {
      setPayError(
        error.message ||
          'Online payment is currently unavailable. Please try again later.'
      )
      setPayLoading(false)
    }
  }

  const handleReceiptUpload = async (event) => {
  event.preventDefault()

  if (!receiptFile || !app || receiptLoading) return

  // Save the form element before the first await.
  const formElement = event.currentTarget

  setReceiptError('')
  setReceiptSuccess('')
  setReceiptLoading(true)

  try {
    const path = await uploadPaymentProof(app, receiptFile)

    setApp((current) => ({
      ...current,
      paymentProofPath: path,
      paymentProofStatus: 'pending_review',
    }))

    setReceiptFile(null)
    formElement.reset()

    setReceiptSuccess(
      'Your receipt was uploaded and is awaiting review.'
    )
  } catch (error) {
    console.error('Receipt upload failed:', error)
    setReceiptError(
      error.message || 'Could not upload your receipt. Please try again.'
    )
  } finally {
    setReceiptLoading(false)
  }
}

  if (loading) {
    return (
      <div className="py-16">
        <LoadingSpinner full label="Loading application..." />
      </div>
    )
  }

  if (loadError) {
    return (
      <Alert type="error" title="Unable to load application">
        {loadError}
      </Alert>
    )
  }

  if (!app) {
    return (
      <Alert type="error" title="Application not found">
        We couldn't find that application.
      </Alert>
    )
  }

  const canUploadReceipt =
    app.feeStatus === FEE_STATUS.PAYMENT_REQUIRED ||
    app.feeStatus === FEE_STATUS.VERIFICATION_PENDING

  return (
    <div>
      <Link
        to="/dashboard/applications"
        className="text-sm font-medium text-accent-600 hover:text-accent-700"
      >
        &larr; Back to applications
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">
            {app.reference}
          </h1>

          <p className="mt-1 text-navy-500">
            Submitted {formatDate(app.submittedAt)}
          </p>
        </div>

        <div className="flex gap-2">
          <ApplicationStatusBadge status={app.applicationStatus} />
          <PaymentStatusBadge status={app.feeStatus} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="font-semibold text-navy-900">
              Loan information
            </h2>

            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Row
                label="Requested amount"
                value={formatCurrency(app.requestedAmount)}
              />
              <Row label="Loan term" value={`${app.loanTerm} days`} />
              <Row label="Purpose" value={titleCase(app.loanPurpose)} />
            </dl>
          </Card>

          <Card>
            <h2 className="font-semibold text-navy-900">
              Applicant information
            </h2>

            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Row
                label="Name"
                value={[
                  app.applicant?.firstName,
                  app.applicant?.lastName,
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
              <Row label="Email" value={app.applicant?.email} />
              <Row label="Phone" value={app.applicant?.phone} />
              <Row
                label="Address"
                value={[
                  app.address?.city,
                  app.address?.state,
                  app.address?.zip,
                ]
                  .filter(Boolean)
                  .join(', ')}
              />
            </dl>
          </Card>

          <Card>
            <h2 className="font-semibold text-navy-900">
              Application timeline
            </h2>

            <ul className="mt-4 space-y-4">
              {(app.timeline || []).map((item, index) => (
                <li key={index} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />

                  <div>
                    <p className="text-sm font-medium text-navy-800">
                      {titleCase(item.event)}
                    </p>

                    <p className="text-xs text-navy-400">
                      {formatDateTime(item.at)}
                    </p>

                    {item.note && (
                      <p className="mt-0.5 text-sm text-navy-500">
                        {item.note}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
  <Card className="overflow-hidden !p-0">
    <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 px-6 py-7 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
            Application payment
          </p>
          <h2 className="mt-2 font-display text-xl font-semibold">
            Registration fee
          </h2>
        </div>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <rect x="2.75" y="5.75" width="18.5" height="12.5" rx="2.25" />
            <path d="M2.75 9.75h18.5M6.5 14.5h3.5" />
          </svg>
        </span>
      </div>

      <p className="mt-7 text-sm text-white/65">Amount due</p>
      <p className="mt-1 font-display text-4xl font-semibold tracking-tight">
        {formatCurrency(app.feeAmount)}
      </p>

      <div className="mt-5 inline-flex rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
        <PaymentStatusBadge status={app.feeStatus} />
      </div>
    </div>

    <div className="space-y-5 px-6 py-6">
      {payError && (
        <Alert type="warning">{payError}</Alert>
      )}

      {app.feeStatus === FEE_STATUS.PAYMENT_REQUIRED && (
        <div>
          <p className="text-sm leading-6 text-navy-600">
            Use the secure payment link to pay your registration fee.
            Return to this page afterward to submit your receipt.
          </p>

          <Button
            variant="accent"
            className="mt-4 w-full"
            onClick={handlePay}
            loading={payLoading}
            disabled={payLoading}
          >
            Pay Registration Fee
          </Button>
        </div>
      )}

      {app.feeStatus === FEE_STATUS.PAID && (
        <Alert type="success">
          Your payment has been verified.
        </Alert>
      )}

      {app.feeStatus === FEE_STATUS.VERIFICATION_PENDING && (
        <Alert type="info">
          Your payment is being reviewed.
        </Alert>
      )}

      {(
        app.feeStatus === FEE_STATUS.NOT_REQUIRED ||
        app.feeStatus === FEE_STATUS.WAIVED
      ) && (
        <Alert type="info">
          No payment is required for this application.
        </Alert>
      )}

      {canUploadReceipt && (
        <div className="border-t border-navy-100 pt-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
                <path d="M4 15.5v2.75A1.75 1.75 0 0 0 5.75 20h12.5A1.75 1.75 0 0 0 20 18.25V15.5" />
              </svg>
            </span>

            <div>
              <h3 className="font-semibold text-navy-900">
                Submit payment receipt
              </h3>
              <p className="mt-1 text-sm leading-6 text-navy-500">
                Already paid? Upload your receipt so we can review
                your payment.
              </p>
            </div>
          </div>

          {app.paymentProofStatus === 'pending_review' && (
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="text-sm font-semibold text-navy-900">
                Receipt received
              </p>
              <p className="mt-1 text-xs leading-5 text-navy-600">
                Your receipt is awaiting review. You can submit a
                replacement below if needed.
              </p>
            </div>
          )}

          {receiptSuccess && (
            <Alert type="success" className="mt-4">
              {receiptSuccess}
            </Alert>
          )}

          {receiptError && (
            <Alert type="error" className="mt-4">
              {receiptError}
            </Alert>
          )}

          <form
            onSubmit={handleReceiptUpload}
            className="mt-5 space-y-4"
          >
            <div>
              <label
                htmlFor="payment-receipt"
                className="block text-sm font-medium text-navy-800"
              >
                Choose a receipt
              </label>

              <input
                id="payment-receipt"
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                disabled={receiptLoading}
                onChange={(event) => {
                  setReceiptFile(event.target.files?.[0] || null)
                  setReceiptError('')
                }}
                className="mt-2 block w-full cursor-pointer rounded-xl border border-navy-200 bg-navy-50 p-2 text-sm text-navy-600 outline-none transition file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-navy-800 hover:border-accent-300 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-2 text-xs text-navy-500">
                JPG, PNG, or PDF · Maximum 5 MB
              </p>
            </div>

            <Button
  type="submit"
  variant={receiptFile ? 'accent' : 'outline'}
  className="w-full transition-colors duration-200"
  loading={receiptLoading}
  disabled={!receiptFile || receiptLoading}
>
  {receiptLoading
    ? 'Uploading receipt…'
    : receiptFile
      ? app.paymentProofStatus === 'pending_review'
        ? 'Submit replacement receipt'
        : 'Submit selected receipt'
      : 'Select a file to continue'}
</Button>
          </form>

          <p className="mt-4 text-center text-xs leading-5 text-navy-400">
            Submitting a receipt starts a review. Payment is confirmed
            only after verification.
          </p>
        </div>
      )}
    </div>
  </Card>

  <Card className="border border-navy-100 bg-navy-50/70">
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-navy-700 shadow-sm">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.7-2.5 2-2.5 4" />
          <path d="M12 16.5h.01" />
        </svg>
      </span>

      <div>
        <h2 className="font-semibold text-navy-900">
          Need help?
        </h2>
        <p className="mt-1 text-sm leading-6 text-navy-500">
          Have a question about your application, payment, or
          receipt? Contact our support team.
        </p>
      </div>
    </div>

    <Button
      as={Link}
      to="/contact"
      variant="outline"
      className="mt-5 w-full"
    >
      Contact support
    </Button>
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
      <dd className="mt-0.5 font-medium text-navy-800">
        {value || '—'}
      </dd>
    </div>
  )
}