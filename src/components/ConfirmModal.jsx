import React from 'react'
import Button from './ui/Button.jsx'

export default function ConfirmModal({
  open, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  onConfirm, onCancel, variant = 'primary', loading = false,
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <div className="absolute inset-0 bg-navy-950/50" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-lifted">
        <h2 id="confirm-modal-title" className="text-lg font-semibold text-navy-900">{title}</h2>
        {description && <p className="mt-2 text-sm text-navy-600">{description}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}
