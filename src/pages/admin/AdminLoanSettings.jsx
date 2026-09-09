import React, { useEffect, useState } from 'react'
import Card from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import Alert from '../../components/Alert.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import { getLoanConfig, updateLoanConfig, FALLBACK_LOAN_CONFIG } from '../../services/settingsService.jsx'

export default function AdminLoanSettings() {
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [incrementsText, setIncrementsText] = useState('')

  useEffect(() => {
    getLoanConfig()
      .then((c) => {
        setForm(c)
        setIncrementsText((c.loanIncrements || FALLBACK_LOAN_CONFIG.loanIncrements).join(', '))
      })
      .finally(() => setLoading(false))
  }, [])

  const update = (field) => (e) => {
    const raw = e.target.value
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'number' ? Number(raw) : raw
    setForm((f) => ({ ...f, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const loanIncrements = incrementsText
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n) && n > 0)
        .sort((a, b) => a - b)

      await updateLoanConfig({ ...form, loanIncrements })
      setMessage({ type: 'success', text: 'Loan configuration updated.' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Unable to save changes. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form) return <LoadingSpinner full label="Loading loan configuration..." />

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">Loan configuration</h1>
      <p className="mt-1 text-navy-500">
        These values are read live by the loan calculator and application flow — changes take effect immediately.
      </p>

      {message && <Alert type={message.type} className="mt-4">{message.text}</Alert>}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-navy-900">Amounts &amp; terms</h2>
          <div className="mt-4 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Minimum loan" type="number" value={form.minLoanAmount} onChange={update('minLoanAmount')} />
              <Input label="Maximum loan" type="number" value={form.maxLoanAmount} onChange={update('maxLoanAmount')} />
            </div>
            <Input
              label="Available loan increments" value={incrementsText} onChange={(e) => setIncrementsText(e.target.value)}
              hint="Comma-separated amounts, e.g. 100, 200, 300, 500, 1000"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Minimum term (days)" type="number" value={form.minimumTerm} onChange={update('minimumTerm')} />
              <Input label="Maximum term (days)" type="number" value={form.maximumTerm} onChange={update('maximumTerm')} />
            </div>
            <Input label="APR (%)" type="number" value={form.apr} onChange={update('apr')} hint="Used only to compute the estimated finance charge shown to customers." />
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-navy-900">Registration fee</h2>
          <div className="mt-4 space-y-5">
            <label className="flex items-center gap-2 text-sm text-navy-700">
              <input type="checkbox" checked={form.registrationFeeEnabled} onChange={update('registrationFeeEnabled')} className="h-4 w-4 rounded border-navy-300 text-brand-600 focus:ring-brand-500" />
              Registration fee enabled
            </label>
            <Input label="Fee threshold" type="number" value={form.feeThreshold} onChange={update('feeThreshold')} hint="Loans at or below this amount use the small loan fee." />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Small loan fee" type="number" value={form.smallLoanFee} onChange={update('smallLoanFee')} />
              <Input label="Large loan fee" type="number" value={form.largeLoanFee} onChange={update('largeLoanFee')} />
            </div>
            <label className="flex items-center gap-2 text-sm text-navy-700">
              <input type="checkbox" checked={form.applicationsEnabled} onChange={update('applicationsEnabled')} className="h-4 w-4 rounded border-navy-300 text-brand-600 focus:ring-brand-500" />
              Applications enabled site-wide
            </label>
          </div>
        </Card>
      </div>

      <Button variant="accent" className="mt-6" onClick={handleSave} loading={saving}>Save configuration</Button>
      <p className="mt-3 text-xs text-navy-400">
        Note: changing these values never alters the fee already recorded on a previously submitted application.
      </p>
    </div>
  )
}
