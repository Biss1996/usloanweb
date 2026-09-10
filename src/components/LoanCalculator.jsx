import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

import Card from './ui/Card.jsx'
import Button from './ui/Button.jsx'
import LoanAmountSelector from './LoanAmountSelector.jsx'

import {
  estimateFinanceCharge,
  FALLBACK_LOAN_CONFIG,
  getLoanConfig,
} from '../services/settingsService.jsx'

import { formatCurrency } from '../utils/formatters.jsx'

// Shared across component mounts so multiple calculators do not create
// simultaneous requests for the same Firestore configuration.
let loanConfigRequest = null

function loadLoanConfigOnce() {
  if (!loanConfigRequest) {
    loanConfigRequest = getLoanConfig().catch((error) => {
      // Allow a later mount to retry after a failed request.
      loanConfigRequest = null
      throw error
    })
  }

  return loanConfigRequest
}

function selectInitialAmount(config, currentAmount) {
  const increments = Array.isArray(config?.loanIncrements)
    ? config.loanIncrements
    : FALLBACK_LOAN_CONFIG.loanIncrements

  if (increments.includes(currentAmount)) {
    return currentAmount
  }

  return increments[2] ?? increments[0] ?? currentAmount
}

function normalizeTerm(config, currentTerm) {
  const minimum = Number(config?.minimumTerm)
  const maximum = Number(config?.maximumTerm)

  if (
    !Number.isFinite(minimum) ||
    !Number.isFinite(maximum)
  ) {
    return currentTerm
  }

  return Math.min(
    Math.max(currentTerm, minimum),
    maximum
  )
}

export default function LoanCalculator() {
  // Render immediately rather than blocking the complete calculator.
  const [config, setConfig] = useState(
    FALLBACK_LOAN_CONFIG
  )

  const [amount, setAmount] = useState(() =>
    selectInitialAmount(
      FALLBACK_LOAN_CONFIG,
      500
    )
  )

  const [term, setTerm] = useState(
    FALLBACK_LOAN_CONFIG.minimumTerm
  )

  const [configStatus, setConfigStatus] =
    useState('loading')

  useEffect(() => {
    let active = true

    loadLoanConfigOnce()
      .then((currentConfig) => {
        if (!active || !currentConfig) return

        setConfig(currentConfig)

        setAmount((currentAmount) =>
          selectInitialAmount(
            currentConfig,
            currentAmount
          )
        )

        setTerm((currentTerm) =>
          normalizeTerm(
            currentConfig,
            currentTerm
          )
        )

        setConfigStatus('ready')
      })
      .catch((error) => {
        if (!active) return

        console.error(
          'Unable to load current loan configuration:',
          error
        )

        setConfigStatus('fallback')
      })

    return () => {
      active = false
    }
  }, [])

  const loanAmounts = useMemo(() => {
    if (
      Array.isArray(config?.loanIncrements) &&
      config.loanIncrements.length > 0
    ) {
      return config.loanIncrements
    }

    return FALLBACK_LOAN_CONFIG.loanIncrements
  }, [config])

  const results = useMemo(() => {
    const principal = Number(amount)
    const apr = Number(config.apr)
    const numberOfDays = Number(term)

    const financeCharge = estimateFinanceCharge(
      principal,
      apr,
      numberOfDays
    )

    return {
      financeCharge,
      totalRepayment:
        principal + financeCharge,
    }
  }, [config.apr, amount, term])

  return (
    <Card className="overflow-hidden !p-0">
      <div className="grid grid-cols-1 lg:grid-cols-5">
        <div className="p-6 lg:col-span-3 lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold text-navy-900">
                Loan calculator
              </h2>

              <p className="mt-1 max-w-xl text-sm text-navy-500">
                Adjust the amount and term to see estimated
                costs. Final terms are provided after review.
              </p>
            </div>

            <ConfigStatus status={configStatus} />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-navy-800">
              Loan amount
            </label>

            <LoanAmountSelector
              amounts={loanAmounts}
              value={amount}
              onChange={setAmount}
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="term"
              className="mb-2 block text-sm font-medium text-navy-800"
            >
              Loan term:{' '}
              <span className="font-semibold text-navy-900">
                {term} days
              </span>
            </label>

            <input
              id="term"
              type="range"
              min={config.minimumTerm}
              max={config.maximumTerm}
              value={term}
              onChange={(event) =>
                setTerm(Number(event.target.value))
              }
              className="w-full accent-brand-600"
            />

            <div className="mt-1 flex justify-between text-xs text-navy-400">
              <span>
                {config.minimumTerm} days
              </span>

              <span>
                {config.maximumTerm} days
              </span>
            </div>
          </div>

          <Button
            as={Link}
            to="/apply"
            variant="accent"
            size="lg"
            className="mt-8 w-full sm:w-auto"
          >
            Check loan options
          </Button>
        </div>

        <div className="bg-navy-950 p-6 text-white lg:col-span-2 lg:p-8">
          <p className="text-xs font-medium uppercase tracking-wide text-navy-400">
            Estimated summary
          </p>

          <dl className="mt-4 space-y-4">
            <Row
              label="Requested amount"
              value={formatCurrency(amount)}
            />

            <Row
              label="Loan term"
              value={`${term} days`}
            />

            <Row
              label="Estimated finance charge"
              value={formatCurrency(
                results.financeCharge
              )}
            />

            <Row
              label="Estimated total repayment"
              value={formatCurrency(
                results.totalRepayment
              )}
              emphasize
            />

            <Row
              label="Estimated APR"
              value={`${config.apr}%`}
            />
          </dl>

          <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-relaxed text-navy-400">
            These estimates are illustrative and do not
            constitute a loan offer. Actual availability,
            APR, finance charges and repayment terms depend
            on eligibility, underwriting and applicable
            state law.
          </p>
        </div>
      </div>
    </Card>
  )
}

function ConfigStatus({ status }) {
  if (status === 'loading') {
    return (
      <span
        className="rounded-full bg-navy-50 px-3 py-1 text-xs text-navy-500"
        role="status"
      >
        Updating estimates…
      </span>
    )
  }

  if (status === 'fallback') {
    return (
      <span
        className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700"
        role="status"
      >
        Current configuration unavailable
      </span>
    )
  }

  return null
}

function Row({
  label,
  value,
  emphasize = false,
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <dt className="text-navy-400">
        {label}
      </dt>

      <dd
        className={
          emphasize
            ? 'font-display text-lg font-semibold text-brand-300'
            : 'font-medium text-white'
        }
      >
        {value}
      </dd>
    </div>
  )
}