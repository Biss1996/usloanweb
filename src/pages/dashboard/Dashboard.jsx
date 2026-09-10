import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge.jsx'
import PaymentStatusBadge from '../../components/PaymentStatusBadge.jsx'

import { useAuth } from '../../hooks/useAuth.jsx'
import { listUserApplications } from '../../services/applicationService.jsx'

import {
  formatCurrency,
  formatDate,
} from '../../utils/formatters.jsx'

import {
  APPLICATION_STATUS,
  FEE_STATUS,
} from '../../config/constants.jsx'

export default function Dashboard() {
  const {
    profile,
    profileLoading,
    user,
  } = useAuth()

  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const userId = user?.uid

  useEffect(() => {
    let active = true

    if (!userId) {
      setApplications([])
      setLoadError('')
      setLoading(false)

      return () => {
        active = false
      }
    }

    async function loadApplications() {
      setLoading(true)
      setLoadError('')

      try {
        const result = await listUserApplications(
          userId,
          50
        )

        if (!active) return

        setApplications(result)
      } catch (error) {
        if (!active) return

        console.error(
          'Failed to list customer applications:',
          error
        )

        setApplications([])
        setLoadError(
          'We could not load your applications. Please try again.'
        )
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadApplications()

    return () => {
      active = false
    }
  }, [userId, reloadKey])

  const recentApplications = useMemo(
    () => applications.slice(0, 6),
    [applications]
  )

  const summary = useMemo(() => {
    return applications.reduce(
      (totals, application) => {
        const status = application.applicationStatus

        if (
          status !== APPLICATION_STATUS.DECLINED &&
          status !== APPLICATION_STATUS.CANCELLED
        ) {
          totals.active += 1
        }

        if (
          status === APPLICATION_STATUS.UNDER_REVIEW
        ) {
          totals.underReview += 1
        }

        if (
          status === APPLICATION_STATUS.APPROVED
        ) {
          totals.approved += 1
        }

        if (
          application.feeStatus ===
          FEE_STATUS.PAYMENT_REQUIRED
        ) {
          totals.paymentRequired += 1
        }

        return totals
      },
      {
        active: 0,
        underReview: 0,
        approved: 0,
        paymentRequired: 0,
      }
    )
  }, [applications])

  const retryLoading = () => {
    setReloadKey((currentKey) => currentKey + 1)
  }

  return (
    <div>
      <header>
        <h1 className="font-display text-2xl font-semibold text-navy-900">
          Welcome
          {profile?.firstName
            ? `, ${profile.firstName}`
            : ''}
        </h1>

        <p className="mt-1 text-navy-500">
          {profileLoading
            ? 'Loading your account details…'
            : "Here's a snapshot of your loan applications."}
        </p>
      </header>

      <section
        className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4"
        aria-label="Application summary"
      >
        {[
          ['Active applications', summary.active],
          ['Under review', summary.underReview],
          ['Approved', summary.approved],
          ['Payments required', summary.paymentRequired],
        ].map(([label, value]) => (
          <Card
            key={label}
            className="text-center"
          >
            <p className="font-display text-3xl font-semibold text-navy-900">
              {loading ? '—' : value}
            </p>

            <p className="mt-1 text-xs text-navy-500">
              {label}
            </p>
          </Card>
        ))}
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-navy-900">
            Recent applications
          </h2>

          <Button
            as={Link}
            to="/apply"
            variant="accent"
            size="sm"
          >
            New application
          </Button>
        </div>

        <div aria-live="polite">
          {loading ? (
            <Card className="flex justify-center py-12">
              <LoadingSpinner label="Loading applications…" />
            </Card>
          ) : loadError ? (
            <Card className="py-10 text-center">
              <p className="text-sm text-red-600">
                {loadError}
              </p>

              <button
                type="button"
                onClick={retryLoading}
                className="mt-4 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700"
              >
                Try again
              </button>
            </Card>
          ) : applications.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="Start your first application to see your loan options."
              action={
                <Button
                  as={Link}
                  to="/apply"
                  variant="accent"
                >
                  Check loan options
                </Button>
              }
            />
          ) : (
            <ApplicationList
              applications={recentApplications}
            />
          )}
        </div>
      </section>
    </div>
  )
}

function ApplicationList({ applications }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
            <tr>
              <th className="px-5 py-3 font-medium">
                Reference
              </th>

              <th className="px-5 py-3 font-medium">
                Amount
              </th>

              <th className="px-5 py-3 font-medium">
                Submitted
              </th>

              <th className="px-5 py-3 font-medium">
                Status
              </th>

              <th className="px-5 py-3 font-medium">
                Fee
              </th>

              <th className="px-5 py-3 font-medium">
                Payment
              </th>

              <th
                className="px-5 py-3"
                aria-label="Actions"
              />
            </tr>
          </thead>

          <tbody className="divide-y divide-navy-100">
            {applications.map((application) => (
              <tr key={application.id}>
                <td className="px-5 py-3.5 font-medium text-navy-900">
                  {application.reference}
                </td>

                <td className="px-5 py-3.5 text-navy-600">
                  {formatCurrency(
                    application.requestedAmount
                  )}
                </td>

                <td className="px-5 py-3.5 text-navy-600">
                  {formatDate(application.submittedAt)}
                </td>

                <td className="px-5 py-3.5">
                  <ApplicationStatusBadge
                    status={
                      application.applicationStatus
                    }
                  />
                </td>

                <td className="px-5 py-3.5 text-navy-600">
                  {formatCurrency(
                    application.feeAmount
                  )}
                </td>

                <td className="px-5 py-3.5">
                  <PaymentStatusBadge
                    status={application.feeStatus}
                  />
                </td>

                <td className="px-5 py-3.5 text-right">
                  <Link
                    to={`/dashboard/application/${application.id}`}
                    className="text-xs font-medium text-accent-600 hover:text-accent-700"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 sm:hidden">
        {applications.map((application) => (
          <Card key={application.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-navy-900">
                {application.reference}
              </p>

              <ApplicationStatusBadge
                status={application.applicationStatus}
              />
            </div>

            <p className="mt-2 text-sm text-navy-500">
              {formatCurrency(
                application.requestedAmount
              )}
              {' · '}
              {formatDate(application.submittedAt)}
            </p>

            <div className="mt-2">
              <PaymentStatusBadge
                status={application.feeStatus}
              />
            </div>

            <Link
              to={`/dashboard/application/${application.id}`}
              className="mt-3 block text-sm font-medium text-accent-600"
            >
              View application &rarr;
            </Link>
          </Card>
        ))}
      </div>
    </>
  )
}