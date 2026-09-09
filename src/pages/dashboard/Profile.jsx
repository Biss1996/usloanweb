import React, { useState } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../config/firebase.jsx'
import Card from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Button from '../../components/ui/Button.jsx'
import Alert from '../../components/Alert.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { isRequired, isValidUsPhone } from '../../utils/validation.jsx'
import { US_STATES } from '../../config/constants.jsx'

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    firstName: profile?.firstName || '', lastName: profile?.lastName || '',
    phone: profile?.phone || '', state: profile?.state || '',
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!isRequired(form.firstName)) next.firstName = 'Required.'
    if (!isRequired(form.lastName)) next.lastName = 'Required.'
    if (!isValidUsPhone(form.phone)) next.phone = 'Please enter a valid US phone number.'
    setErrors(next)
    if (Object.keys(next).length) return

    setStatus('loading')
    try {
      await updateDoc(doc(db, 'users', user.uid), { ...form, updatedAt: serverTimestamp() })
      await refreshProfile()
      setStatus('success')
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">Profile</h1>
      <p className="mt-1 text-navy-500">Keep your contact information up to date.</p>

      <Card className="mt-6 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {status === 'success' && <Alert type="success">Your profile has been updated.</Alert>}
          {status === 'error' && <Alert type="error">We couldn't save your changes. Please try again.</Alert>}

          <Input label="Email" value={profile?.email || ''} disabled className="bg-navy-50 text-navy-400" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input label="First name" required value={form.firstName} onChange={update('firstName')} error={errors.firstName} />
            <Input label="Last name" required value={form.lastName} onChange={update('lastName')} error={errors.lastName} />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input label="Phone" required value={form.phone} onChange={update('phone')} error={errors.phone} />
            <Select label="State" required options={US_STATES} value={form.state} onChange={update('state')} />
          </div>
          <Button type="submit" variant="accent" loading={status === 'loading'}>Save changes</Button>
        </form>
      </Card>
    </div>
  )
}
