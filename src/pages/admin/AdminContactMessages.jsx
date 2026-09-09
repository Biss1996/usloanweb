import React, { useEffect, useState } from 'react'
import Card from '../../components/ui/Card.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { listContactMessages } from '../../services/adminService.jsx'
import { formatDateTime } from '../../utils/formatters.jsx'

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listContactMessages().then(setMessages).catch(() => setMessages([])).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner full label="Loading contact messages..." />

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">Contact messages</h1>
      <p className="mt-1 text-navy-500">Messages submitted through the public contact form.</p>

      <div className="mt-6">
        {messages.length === 0 ? (
          <EmptyState title="No messages yet" description="Submitted contact form messages will appear here." />
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <Card key={m.id}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-navy-900">{m.subject}</p>
                    <p className="text-sm text-navy-500">{m.name} &middot; {m.email}{m.phone ? ` \u00b7 ${m.phone}` : ''}</p>
                  </div>
                  <p className="text-xs text-navy-400">{formatDateTime(m.createdAt)}</p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-navy-600">{m.message}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
