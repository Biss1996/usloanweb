import React, { useEffect, useState } from 'react'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import { listStates, upsertState } from '../../services/settingsService.jsx'
import { US_STATES } from '../../config/constants.jsx'

export default function AdminStates() {
  const [statesMap, setStatesMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingCode, setSavingCode] = useState(null)

  useEffect(() => {
    listStates()
      .then((list) => {
        const map = {}
        list.forEach((s) => { map[s.id] = s })
        setStatesMap(map)
      })
      .finally(() => setLoading(false))
  }, [])

  const toggle = async (code, name) => {
    setSavingCode(code)
    const current = statesMap[code] || { stateCode: code, stateName: name, enabled: true }
    const next = { ...current, enabled: !current.enabled }
    await upsertState(code, next)
    setStatesMap((m) => ({ ...m, [code]: next }))
    setSavingCode(null)
  }

  if (loading) return <LoadingSpinner full label="Loading state availability..." />

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">State availability</h1>
      <p className="mt-1 text-navy-500">
        Enable or disable applications for each state. States not yet configured default to enabled.
      </p>

      <Card className="mt-6 !p-0">
        <div className="grid grid-cols-1 divide-y divide-navy-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3">
          {US_STATES.map(([code, name]) => {
            const enabled = statesMap[code]?.enabled ?? true
            return (
              <div key={code} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-navy-800">{name}</p>
                  <p className="text-xs text-navy-400">{code}</p>
                </div>
                <button
                  onClick={() => toggle(code, name)}
                  disabled={savingCode === code}
                  className="disabled:opacity-50"
                >
                  <Badge tone={enabled ? 'success' : 'neutral'}>{enabled ? 'Enabled' : 'Disabled'}</Badge>
                </button>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
