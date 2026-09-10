import React, {
  useContext,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Select from '../components/ui/Select.jsx'
import Button from '../components/ui/Button.jsx'
import Alert from '../components/Alert.jsx'

import { AuthContext } from '../context/AuthContext.jsx'
import { registerUser } from '../services/authService.jsx'

import {
  isRequired,
  isValidEmail,
  isValidUsPhone,
} from '../utils/validation.jsx'

import { US_STATES } from '../config/constants.jsx'

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  state: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false,
  agreePrivacy: false,
  agreeEsign: false,
}

function friendlyAuthError(code) {
  const messages = {
    'auth/email-already-in-use':
      'An account with this email already exists.',

    'auth/weak-password':
      'Please choose a stronger password with at least 8 characters.',

    'auth/invalid-email':
      'Please enter a valid email address.',

    'auth/network-request-failed':
      'Unable to connect. Check your internet connection and try again.',

    'auth/operation-not-allowed':
      'Account registration is currently unavailable. Please contact support.',

    'auth/too-many-requests':
      'Too many attempts. Please wait a moment and try again.',
  }

  return (
    messages[code] ||
    'We were unable to create your account. Please try again.'
  )
}

export default function Register() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { refreshProfile } = useContext(AuthContext)

  const update = (field) => (event) => {
    const value =
      event.target.type === 'checkbox'
        ? event.target.checked
        : event.target.value

    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))

    // Remove the error as the user corrects the field.
    setErrors((currentErrors) => {
      const errorField =
        field.startsWith('agree')
          ? 'agreements'
          : field

      if (!currentErrors[errorField]) {
        return currentErrors
      }

      const nextErrors = {
        ...currentErrors,
      }

      delete nextErrors[errorField]
      return nextErrors
    })

    if (authError) {
      setAuthError('')
    }
  }

  const validate = () => {
    const nextErrors = {}

    const firstName = form.firstName.trim()
    const lastName = form.lastName.trim()
    const email = form.email.trim()
    const phone = form.phone.trim()

    if (!isRequired(firstName)) {
      nextErrors.firstName = 'Required.'
    }

    if (!isRequired(lastName)) {
      nextErrors.lastName = 'Required.'
    }

    if (!isRequired(email)) {
      nextErrors.email =
        'Please enter your email address.'
    } else if (!isValidEmail(email)) {
      nextErrors.email =
        'Please enter a valid email address.'
    }

    if (!isRequired(phone)) {
      nextErrors.phone =
        'Please enter your phone number.'
    } else if (!isValidUsPhone(phone)) {
      nextErrors.phone =
        'Please enter a valid US phone number.'
    }

    if (!isRequired(form.state)) {
      nextErrors.state =
        'Please select your state.'
    }

    if (String(form.password).length < 8) {
      nextErrors.password =
        'Password must be at least 8 characters.'
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword =
        'Please confirm your password.'
    } else if (
      form.password !== form.confirmPassword
    ) {
      nextErrors.confirmPassword =
        'Passwords do not match.'
    }

    if (
      !form.agreeTerms ||
      !form.agreePrivacy ||
      !form.agreeEsign
    ) {
      nextErrors.agreements =
        'Please agree to all terms to continue.'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    // Prevent double-clicks from creating duplicate requests.
    if (loading) return

    setAuthError('')

    if (!validate()) return

    setLoading(true)

    try {
      await registerUser({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        state: form.state,
        password: form.password,
      })

      // Start loading the new Firestore profile without delaying navigation.
      const profileRequest = refreshProfile()

      navigate('/dashboard', {
        replace: true,
      })

      void profileRequest
    } catch (error) {
      console.error(
        'Account registration failed:',
        error?.code || error
      )

      setAuthError(
        friendlyAuthError(error?.code)
      )

      setLoading(false)
    }
  }

  return (
    <div className="container-page flex justify-center py-16">
      <Card className="w-full max-w-xl">
        <h1 className="font-display text-2xl font-semibold text-navy-900">
          Create your account
        </h1>

        <p className="mt-1.5 text-sm text-navy-500">
          It only takes a minute to get started.
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

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="First name"
              name="firstName"
              required
              value={form.firstName}
              onChange={update('firstName')}
              error={errors.firstName}
              autoComplete="given-name"
              disabled={loading}
            />

            <Input
              label="Last name"
              name="lastName"
              required
              value={form.lastName}
              onChange={update('lastName')}
              error={errors.lastName}
              autoComplete="family-name"
              disabled={loading}
            />
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

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Phone number"
              name="phone"
              type="tel"
              required
              placeholder="(555) 123-4567"
              value={form.phone}
              onChange={update('phone')}
              error={errors.phone}
              autoComplete="tel"
              inputMode="tel"
              disabled={loading}
            />

            <Select
              label="State"
              name="state"
              required
              placeholder="Select your state"
              options={US_STATES}
              value={form.state}
              onChange={update('state')}
              error={errors.state}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Password"
              name="password"
              type="password"
              required
              value={form.password}
              onChange={update('password')}
              error={errors.password}
              autoComplete="new-password"
              hint="At least 8 characters"
              disabled={loading}
            />

            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              required
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              error={errors.confirmPassword}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <div className="space-y-3 rounded-xl bg-navy-50 p-4">
            <label className="flex items-start gap-3 text-sm text-navy-700">
              <input
                type="checkbox"
                checked={form.agreeTerms}
                onChange={update('agreeTerms')}
                disabled={loading}
                className="mt-0.5 h-4 w-4 rounded border-navy-300 text-brand-600 focus:ring-brand-500"
              />

              <span>
                I agree to the{' '}
                <Link
                  className="underline"
                  to="/terms"
                  target="_blank"
                >
                  Terms of Use
                </Link>
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm text-navy-700">
              <input
                type="checkbox"
                checked={form.agreePrivacy}
                onChange={update('agreePrivacy')}
                disabled={loading}
                className="mt-0.5 h-4 w-4 rounded border-navy-300 text-brand-600 focus:ring-brand-500"
              />

              <span>
                I agree to the{' '}
                <Link
                  className="underline"
                  to="/privacy"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm text-navy-700">
              <input
                type="checkbox"
                checked={form.agreeEsign}
                onChange={update('agreeEsign')}
                disabled={loading}
                className="mt-0.5 h-4 w-4 rounded border-navy-300 text-brand-600 focus:ring-brand-500"
              />

              <span>
                I consent to{' '}
                <Link
                  className="underline"
                  to="/e-sign-consent"
                  target="_blank"
                >
                  Electronic Communications
                </Link>
              </span>
            </label>

            {errors.agreements && (
              <p
                className="text-xs font-medium text-red-600"
                role="alert"
              >
                {errors.agreements}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="accent"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-navy-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-accent-600 hover:text-accent-700"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  )
}