import React, { useEffect, useState } from 'react'
import Card from '../../components/ui/Card.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { listNotifications, markNotificationRead } from '../../services/notificationService.jsx'
import { formatDateTime, titleCase } from '../../utils/formatters.jsx'

export default function Notifications() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    listNotifications(user.uid).then(setItems).catch(() => setItems([])).finally(() => setLoading(false))
  }, [user])

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">Notifications</h1>
      <p className="mt-1 text-navy-500">Updates about your applications and account.</p>

      <div className="mt-6">
        {loading ? (
          <Card className="flex justify-center py-12"><LoadingSpinner /></Card>
        ) : items.length === 0 ? (
          <EmptyState title="No notifications yet" description="We'll let you know here when there's an update." />
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <Card
                key={n.id}
                className={`cursor-pointer ${!n.read ? 'border-accent-200 bg-accent-50/40' : ''}`}
                onClick={() => {
                  markNotificationRead(user.uid, n.id)
                  setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: true } : i)))
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-navy-900">{n.title}</p>
                    <p className="mt-1 text-sm text-navy-500">{n.message}</p>
                    <p className="mt-2 text-xs text-navy-400">{formatDateTime(n.createdAt)}</p>
                  </div>
                  <Badge tone="neutral">{titleCase(n.type)}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
