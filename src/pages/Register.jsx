import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Select from '../components/ui/Select.jsx'
import Button from '../components/ui/Button.jsx'
import Alert from '../components/Alert.jsx'
import { registerUser } from '../services/authService.jsx'
import { isValidEmail, isValidUsPhone, isRequired } from '../utils/validation.jsx'
import { US_STATES } from '../config/constants.jsx'

const initialForm = {
  firstName: '', lastName: '', email: '', phone: '', state: '',
  password: '', confirmPassword: '',
  agreeTerms: false, agreePrivacy: false, agreeEsign: false,
}

function friendlyAuthError(code) {
  const map = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Please choose a stronger password (at least 8 characters).',
    'auth/invalid-email': 'Please enter a valid email address.',
  }
  return map[code] || 'We were unable to create your account. Please try again.'
}

export default function Register() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: value }))
  }

  const validate = () => {
    const next = {}
    if (!isRequired(form.firstName)) next.firstName = 'Required.'
    if (!isRequired(form.lastName)) next.lastName = 'Required.'
    if (!isValidEmail(form.email)) next.email = 'Please enter a valid email address.'
    if (!isValidUsPhone(form.phone)) next.phone = 'Please enter a valid US phone number.'
    if (!isRequired(form.state)) next.state = 'Please select your state.'
    if (String(form.password).length < 8) next.password = 'Password must be at least 8 characters.'
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match.'
    if (!form.agreeTerms || !form.agreePrivacy || !form.agreeEsign) {
      next.agreements = 'Please agree to all terms to continue.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')
    if (!validate()) return
    setLoading(true)
    try {
      await registerUser(form)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setAuthError(friendlyAuthError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-page flex justify-center py-16">
      <Card className="w-full max-w-xl">
        <h1 className="font-display text-2xl font-semibold text-navy-900">Create your account</h1>
        <p className="mt-1.5 text-sm text-navy-500">It only takes a minute to get started.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          {authError && <Alert type="error">{authError}</Alert>}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input label="First name" name="firstName" required value={form.firstName} onChange={update('firstName')} error={errors.firstName} />
            <Input label="Last name" name="lastName" required value={form.lastName} onChange={update('lastName')} error={errors.lastName} />
          </div>
          <Input label="Email" name="email" type="email" required value={form.email} onChange={update('email')} error={errors.email} autoComplete="email" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input label="Phone number" name="phone" type="tel" required placeholder="(555) 123-4567" value={form.phone} onChange={update('phone')} error={errors.phone} />
            <Select label="State" name="state" required placeholder="Select your state" options={US_STATES} value={form.state} onChange={update('state')} error={errors.state} />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input label="Password" name="password" type="password" required value={form.password} onChange={update('password')} error={errors.password} autoComplete="new-password" hint="At least 8 characters" />
            <Input label="Confirm password" name="confirmPassword" type="password" required value={form.confirmPassword} onChange={update('confirmPassword')} error={errors.confirmPassword} autoComplete="new-password" />
          </div>

          <div className="space-y-3 rounded-xl bg-navy-50 p-4">
            {[
              ['agreeTerms', <>I agree to the <Link className="underline" to="/terms">Terms of Use</Link></>],
              ['agreePrivacy', <>I agree to the <Link className="underline" to="/privacy">Privacy Policy</Link></>],
              ['agreeEsign', <>I consent to <Link className="underline" to="/e-sign-consent">Electronic Communications</Link></>],
            ].map(([field, label]) => (
              <label key={field} className="flex items-start gap-3 text-sm text-navy-700">
                <input type="checkbox" checked={form[field]} onChange={update(field)} className="mt-0.5 h-4 w-4 rounded border-navy-300 text-brand-600 focus:ring-brand-500" />
                <span>{label}</span>
              </label>
            ))}
            {errors.agreements && <p className="text-xs font-medium text-red-600">{errors.agreements}</p>}
          </div>

          <Button type="submit" variant="accent" className="w-full" loading={loading}>Create account</Button>
        </form>

        <p className="mt-6 text-center text-sm text-navy-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent-600 hover:text-accent-700">Sign in</Link>
        </p>
      </Card>
    </div>
  )
}
