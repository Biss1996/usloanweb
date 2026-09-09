import React from 'react'
import Badge from './ui/Badge.jsx'
import { titleCase } from '../utils/formatters.jsx'

const TONE_MAP = {
  pending: 'neutral',
  payment_required: 'warning',
  verification_pending: 'info',
  paid: 'success',
  failed: 'danger',
  refunded: 'neutral',
  waived: 'neutral',
  not_required: 'neutral',
}

export default function PaymentStatusBadge({ status }) {
  return <Badge tone={TONE_MAP[status] || 'neutral'}>{titleCase(status)}</Badge>
}
