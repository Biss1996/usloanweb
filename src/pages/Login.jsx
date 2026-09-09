import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import Alert from '../components/Alert.jsx'
import { loginUser } from '../services/authService.jsx'
import { isValidEmail, isRequired } from '../utils/validation.jsx'

function friendlyAuthError(code) {
  const map = {
    'auth/invalid-credential': 'The email or password you entered is incorrect.',
    'auth/wrong-password': 'The email or password you entered is incorrect.',
    'auth/user-not-found': 'The email or password you entered is incorrect.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  }
  return map[code] || 'We were unable to sign you in. Please try again.'
}

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!isValidEmail(form.email)) next.email = 'Please enter a valid email address.'
    if (!isRequired(form.password)) next.password = 'Please enter your password.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')
    if (!validate()) return
    setLoading(true)
    try {
      await loginUser(form.email, form.password)
      const redirectTo = location.state?.from?.pathname || '/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setAuthError(friendlyAuthError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <h1 className="font-display text-2xl font-semibold text-navy-900">Sign in</h1>
        <p className="mt-1.5 text-sm text-navy-500">Access your dashboard and application status.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          {authError && <Alert type="error">{authError}</Alert>}
          <Input label="Email" name="email" type="email" required value={form.email} onChange={update('email')} error={errors.email} autoComplete="email" />
          <div>
            <Input label="Password" name="password" type="password" required value={form.password} onChange={update('password')} error={errors.password} autoComplete="current-password" />
            <Link to="/forgot-password" className="mt-1.5 inline-block text-xs font-medium text-accent-600 hover:text-accent-700">
              Forgot your password?
            </Link>
          </div>
          <Button type="submit" variant="accent" className="w-full" loading={loading}>Sign in</Button>
        </form>

        <p className="mt-6 text-center text-sm text-navy-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-accent-600 hover:text-accent-700">Create one</Link>
        </p>
      </Card>
    </div>
  )
}
