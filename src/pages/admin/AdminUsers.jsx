import React, { useEffect, useState } from 'react'
import Card from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { listAllUsers } from '../../services/adminService.jsx'
import { formatDate } from '../../utils/formatters.jsx'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    listAllUsers().then(setUsers).catch(() => setUsers([])).finally(() => setLoading(false))
  }, [])

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return !q || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q)
  })

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">Users</h1>
      <p className="mt-1 text-navy-500">All registered customer accounts.</p>

      <Input className="mt-6 max-w-sm" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="mt-6">
        {loading ? (
          <Card className="flex justify-center py-12"><LoadingSpinner /></Card>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">State</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="px-5 py-3.5 font-medium text-navy-900">{u.firstName} {u.lastName}</td>
                    <td className="px-5 py-3.5 text-navy-600">{u.email}</td>
                    <td className="px-5 py-3.5 text-navy-600">{u.state}</td>
                    <td className="px-5 py-3.5"><Badge tone={u.accountStatus === 'active' ? 'success' : 'neutral'}>{u.accountStatus}</Badge></td>
                    <td className="px-5 py-3.5 text-navy-600">{formatDate(u.createdAt)}</td>
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
