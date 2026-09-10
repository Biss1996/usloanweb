import React, { useState } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import Alert from '../components/Alert.jsx'

import { loginUser } from '../services/authService.jsx'
import {
  isRequired,
  isValidEmail,
} from '../utils/validation.jsx'

function friendlyAuthError(code) {
  const messages = {
    'auth/invalid-credential':
      'The email or password you entered is incorrect.',

    'auth/wrong-password':
      'The email or password you entered is incorrect.',

    'auth/user-not-found':
      'The email or password you entered is incorrect.',

    'auth/invalid-email':
      'Please enter a valid email address.',

    'auth/user-disabled':
      'This account has been disabled. Please contact support.',

    'auth/too-many-requests':
      'Too many attempts. Please wait a moment and try again.',

    'auth/network-request-failed':
      'Unable to connect. Check your internet connection and try again.',

    'auth/operation-not-allowed':
      'Email sign-in is currently unavailable. Please contact support.',
  }

  return (
    messages[code] ||
    'We were unable to sign you in. Please try again.'
  )
}

function getRedirectPath(location) {
  const from = location.state?.from

  if (typeof from === 'string') {
    return from.startsWith('/') && !from.startsWith('//')
      ? from
      : '/dashboard'
  }

  if (
    from &&
    typeof from.pathname === 'string' &&
    from.pathname.startsWith('/') &&
    !from.pathname.startsWith('//')
  ) {
    return [
      from.pathname,
      from.search || '',
      from.hash || '',
    ].join('')
  }

  return '/dashboard'
}

export default function Login() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState({})
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  const update = (field) => (event) => {
    const { value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))

    // Clear the field error as the customer corrects it.
    setErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors
      }

      const nextErrors = {
        ...currentErrors,
      }

      delete nextErrors[field]
      return nextErrors
    })

    if (authError) {
      setAuthError('')
    }
  }

  const validate = () => {
    const nextErrors = {}
    const email = form.email.trim()

    if (!isRequired(email)) {
      nextErrors.email =
        'Please enter your email address.'
    } else if (!isValidEmail(email)) {
      nextErrors.email =
        'Please enter a valid email address.'
    }

    if (!isRequired(form.password)) {
      nextErrors.password =
        'Please enter your password.'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    // Prevent double-clicks from generating duplicate requests.
    if (loading) return

    setAuthError('')

    if (!validate()) return

    setLoading(true)

    try {
      await loginUser(
        form.email.trim(),
        form.password
      )

      navigate(getRedirectPath(location), {
        replace: true,
      })
    } catch (error) {
      console.error(
        'Sign-in failed:',
        error?.code || error
      )

      setAuthError(
        friendlyAuthError(error?.code)
      )

      setLoading(false)
    }
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <h1 className="font-display text-2xl font-semibold text-navy-900">
          Sign in
        </h1>

        <p className="mt-1.5 text-sm text-navy-500">
          Access your dashboard and application status.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
          noValidate
        >
          <div aria-live="polite">
            {authError && (
              <Alert type="error">
                {authError}
              </Alert>
            )}
          </div>

          <Input
            label="Email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={update('email')}
            error={errors.email}
            autoComplete="email"
            inputMode="email"
            disabled={loading}
          />

          <div>
            <Input
              label="Password"
              name="password"
              type="password"
              required
              value={form.password}
              onChange={update('password')}
              error={errors.password}
              autoComplete="current-password"
              disabled={loading}
            />

            <Link
              to="/forgot-password"
              className="mt-1.5 inline-block text-xs font-medium text-accent-600 hover:text-accent-700"
            >
              Forgot your password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="accent"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-navy-500">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-accent-600 hover:text-accent-700"
          >
            Create one
          </Link>
        </p>
      </Card>
    </div>
  )
}