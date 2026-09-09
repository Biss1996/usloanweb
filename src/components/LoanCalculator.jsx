import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from './ui/Card.jsx'
import Button from './ui/Button.jsx'
import LoanAmountSelector from './LoanAmountSelector.jsx'
import LoadingSpinner from './LoadingSpinner.jsx'
import { getLoanConfig, calculateRegistrationFee, estimateFinanceCharge, FALLBACK_LOAN_CONFIG } from '../services/settingsService.jsx'
import { formatCurrency } from '../utils/formatters.jsx'

export default function LoanCalculator() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState(500)
  const [term, setTerm] = useState(21)

  useEffect(() => {
    getLoanConfig()
      .then((c) => {
        setConfig(c)
        setAmount((prev) => (c.loanIncrements?.includes(prev) ? prev : c.loanIncrements?.[2] || prev))
        setTerm(c.minimumTerm)
      })
      .catch(() => setConfig(FALLBACK_LOAN_CONFIG))
      .finally(() => setLoading(false))
  }, [])

  const results = useMemo(() => {
    if (!config) return null
    const fee = calculateRegistrationFee(amount, config)
    const financeCharge = estimateFinanceCharge(amount, config.apr, term)
    const totalRepayment = amount + financeCharge
    return { fee, financeCharge, totalRepayment }
  }, [config, amount, term])

  if (loading || !config) {
    return (
      <Card className="flex justify-center py-16">
        <LoadingSpinner label="Loading current loan configuration..." />
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden !p-0">
      <div className="grid grid-cols-1 lg:grid-cols-5">
        <div className="p-6 lg:col-span-3 lg:p-8">
          <h3 className="font-display text-xl font-semibold text-navy-900">Loan calculator</h3>
          <p className="mt-1 text-sm text-navy-500">
            Adjust the amount and term to see estimated costs. These figures are estimates —
            your final terms are confirmed during the application review.
          </p>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-navy-800">Loan amount</label>
            <LoanAmountSelector
              amounts={config.loanIncrements || FALLBACK_LOAN_CONFIG.loanIncrements}
              value={amount}
              onChange={setAmount}
            />
          </div>

          <div className="mt-6">
            <label htmlFor="term" className="mb-2 block text-sm font-medium text-navy-800">
              Loan term: <span className="font-semibold text-navy-900">{term} days</span>
            </label>
            <input
              id="term"
              type="range"
              min={config.minimumTerm}
              max={config.maximumTerm}
              value={term}
              onChange={(e) => setTerm(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
            <div className="mt-1 flex justify-between text-xs text-navy-400">
              <span>{config.minimumTerm} days</span>
              <span>{config.maximumTerm} days</span>
            </div>
          </div>

          <Button as={Link} to="/apply" variant="accent" size="lg" className="mt-8 w-full sm:w-auto">
            Check Loan Options
          </Button>
        </div>

        <div className="bg-navy-950 p-6 text-white lg:col-span-2 lg:p-8">
          <p className="text-xs font-medium uppercase tracking-wide text-navy-400">Estimated summary</p>
          <dl className="mt-4 space-y-4">
            <Row label="Requested loan amount" value={formatCurrency(amount)} />
            <Row label="Loan term" value={`${term} days`} />
            <Row label="Estimated finance charge" value={formatCurrency(results.financeCharge)} />
            <Row label="Estimated total repayment" value={formatCurrency(results.totalRepayment)} emphasize />
            <Row label="Estimated APR" value={`${config.apr}%`} />
            <Row label="Registration fee" value={formatCurrency(results.fee)} />
          </dl>
          <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-relaxed text-navy-400">
            All values are estimates based on current loan configuration and may change
            based on eligibility, verification, state law, and final underwriting.
          </p>
        </div>
      </div>
    </Card>
  )
}

function Row({ label, value, emphasize }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <dt className="text-navy-400">{label}</dt>
      <dd className={emphasize ? 'font-display text-lg font-semibold text-brand-300' : 'font-medium text-white'}>
        {value}
      </dd>
    </div>
  )
}
