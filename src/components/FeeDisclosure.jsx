import React from 'react'
import { formatCurrency } from '../utils/formatters.jsx'

export default function FeeDisclosure({ feeAmount, feeThreshold, smallFee, largeFee }) {
  return (
    <div className="rounded-xl bg-navy-50 p-4 text-sm text-navy-600">
      <p>
        A one-time registration fee applies to submitted applications: {' '}
        <span className="font-semibold text-navy-800">{formatCurrency(smallFee)}</span> for loans up to{' '}
        <span className="font-semibold text-navy-800">{formatCurrency(feeThreshold)}</span>, and{' '}
        <span className="font-semibold text-navy-800">{formatCurrency(largeFee)}</span> for loans above that
        amount.
      </p>
      {feeAmount !== undefined && (
        <p className="mt-2 font-semibold text-navy-900">
          Estimated registration fee for this request: {formatCurrency(feeAmount)}
        </p>
      )}
      <p className="mt-2 text-xs text-navy-500">
        Registration fees are collected through an external payment provider after your
        application is submitted, and are separate from your loan's underwriting decision.
      </p>
    </div>
  )
}
