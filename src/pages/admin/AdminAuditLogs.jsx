import React, { useEffect, useState } from 'react'
import Card from '../../components/ui/Card.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { listAuditLogs } from '../../services/adminService.jsx'
import { formatDateTime, titleCase } from '../../utils/formatters.jsx'

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listAuditLogs().then(setLogs).catch(() => setLogs([])).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner full label="Loading audit logs..." />

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">Audit logs</h1>
      <p className="mt-1 text-navy-500">A record of every sensitive action taken across the platform.</p>

      <div className="mt-6">
        {logs.length === 0 ? (
          <EmptyState title="No audit log entries yet" description="Actions like status changes and payment verification will be recorded here." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Action</th>
                  <th className="px-5 py-3 font-medium">Actor</th>
                  <th className="px-5 py-3 font-medium">Target</th>
                  <th className="px-5 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td className="px-5 py-3.5 font-medium text-navy-900">{titleCase(l.action)}</td>
                    <td className="px-5 py-3.5 text-navy-600">
                      <Badge tone={l.actorType === 'admin' ? 'info' : 'neutral'}>{l.actorType}</Badge>{' '}
                      <span className="ml-1 text-xs text-navy-400">{l.actorId}</span>
                    </td>
                    <td className="px-5 py-3.5 text-navy-500">{l.targetId || '—'}</td>
                    <td className="px-5 py-3.5 text-navy-500">{formatDateTime(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
