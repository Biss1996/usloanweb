import React, { useEffect, useState } from 'react'
import Card from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Alert from '../../components/Alert.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import ConfirmModal from '../../components/ConfirmModal.jsx'
import { listPaymentLinks, upsertPaymentLink, deletePaymentLink, isValidHttpsUrl } from '../../services/paymentLinkService.jsx'
import { formatCurrency, formatDateTime } from '../../utils/formatters.jsx'

const EMPTY_LINK = { id: '', name: '', amount: '', loanMin: '', loanMax: '', url: '', enabled: true }

export default function AdminPaymentLinks() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = () => listPaymentLinks().then(setLinks).catch(() => setLinks([])).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openNew = () => { setForm({ ...EMPTY_LINK }); setErrors({}) }
  const openEdit = (link) => { setForm({ ...link }); setErrors({}) }

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: value }))
  }

  const validate = () => {
    const next = {}
    if (!form.name) next.name = 'Required.'
    if (!form.amount || Number(form.amount) <= 0) next.amount = 'Enter a valid fee amount.'
    if (form.loanMin === '' || Number(form.loanMin) < 0) next.loanMin = 'Required.'
    if (form.loanMax === '' || Number(form.loanMax) <= Number(form.loanMin)) next.loanMax = 'Must be greater than minimum.'
    if (!isValidHttpsUrl(form.url)) next.url = 'Must be a valid HTTPS URL.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    setMessage(null)
    try {
      const id = form.id || `fee${form.amount}_${Date.now()}`
      await upsertPaymentLink(id, {
        name: form.name,
        amount: Number(form.amount),
        loanMin: Number(form.loanMin),
        loanMax: Number(form.loanMax),
        url: form.url,
        enabled: Boolean(form.enabled),
      })
      setMessage({ type: 'success', text: 'Payment link saved.' })
      setForm(null)
      await load()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Unable to save payment link.' })
    } finally {
      setSaving(false)
    }
  }

  const toggleEnabled = async (link) => {
    await upsertPaymentLink(link.id, { ...link, enabled: !link.enabled })
    await load()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deletePaymentLink(deleteTarget.id)
    setDeleteTarget(null)
    await load()
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Payment links</h1>
          <p className="mt-1 text-navy-500">
            Manage the real, external payment URLs customers are redirected to when paying a registration fee.
          </p>
        </div>
        <Button variant="accent" onClick={openNew}>Add payment link</Button>
      </div>

      {message && <Alert type={message.type} className="mt-4">{message.text}</Alert>}

      {form && (
        <Card className="mt-6">
          <h2 className="font-semibold text-navy-900">{form.id ? 'Edit payment link' : 'New payment link'}</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input label="Name" required value={form.name} onChange={update('name')} error={errors.name} placeholder="$50 Registration Fee" />
            <Input label="Fee amount (USD)" type="number" required value={form.amount} onChange={update('amount')} error={errors.amount} />
            <Input label="Minimum loan amount" type="number" required value={form.loanMin} onChange={update('loanMin')} error={errors.loanMin} />
            <Input label="Maximum loan amount" type="number" required value={form.loanMax} onChange={update('loanMax')} error={errors.loanMax} />
            <Input
              label="Payment URL" required className="sm:col-span-2" value={form.url} onChange={update('url')} error={errors.url}
              placeholder="https://actual-payment-provider-link.com/..."
              hint="Must be a real HTTPS URL from your payment provider. This site never generates its own payment URLs."
            />
            <label className="flex items-center gap-2 text-sm text-navy-700 sm:col-span-2">
              <input type="checkbox" checked={form.enabled} onChange={update('enabled')} className="h-4 w-4 rounded border-navy-300 text-brand-600 focus:ring-brand-500" />
              Enabled
            </label>
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="accent" onClick={handleSave} loading={saving}>Save payment link</Button>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="mt-6">
        {loading ? (
          <Card className="flex justify-center py-12"><LoadingSpinner /></Card>
        ) : links.length === 0 ? (
          <EmptyState
            title="No payment links configured"
            description='Add a payment link (e.g. "$50 Registration Fee") so customers can pay online.'
            action={<Button variant="accent" onClick={openNew}>Add payment link</Button>}
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Fee</th>
                  <th className="px-5 py-3 font-medium">Loan range</th>
                  <th className="px-5 py-3 font-medium">Payment URL</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Updated</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {links.map((l) => (
                  <tr key={l.id}>
                    <td className="px-5 py-3.5 font-medium text-navy-900">{l.name}</td>
                    <td className="px-5 py-3.5 text-navy-600">{formatCurrency(l.amount)}</td>
                    <td className="px-5 py-3.5 text-navy-600">{formatCurrency(l.loanMin)} – {formatCurrency(l.loanMax)}</td>
                    <td className="max-w-[220px] truncate px-5 py-3.5 text-navy-500">{l.url}</td>
                    <td className="px-5 py-3.5"><Badge tone={l.enabled ? 'success' : 'neutral'}>{l.enabled ? 'Enabled' : 'Disabled'}</Badge></td>
                    <td className="px-5 py-3.5 text-navy-500">{formatDateTime(l.updatedAt)}</td>
                    <td className="space-x-3 px-5 py-3.5 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(l)} className="text-xs font-medium text-accent-600 hover:text-accent-700">Edit</button>
                      <button onClick={() => toggleEnabled(l)} className="text-xs font-medium text-navy-600 hover:text-navy-900">{l.enabled ? 'Disable' : 'Enable'}</button>
                      <button onClick={() => setDeleteTarget(l)} className="text-xs font-medium text-red-600 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete payment link"
        description={`This will permanently remove "${deleteTarget?.name}". Customers will no longer be able to pay via this link.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
