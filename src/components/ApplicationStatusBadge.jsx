import React from 'react'
import Badge from './ui/Badge.jsx'
import { titleCase } from '../utils/formatters.jsx'

const TONE_MAP = {
  draft: 'neutral',
  submitted: 'info',
  under_review: 'warning',
  additional_information_required: 'warning',
  approved: 'success',
  declined: 'danger',
  cancelled: 'neutral',
}

export default function ApplicationStatusBadge({ status }) {
  return <Badge tone={TONE_MAP[status] || 'neutral'}>{titleCase(status)}</Badge>
}
