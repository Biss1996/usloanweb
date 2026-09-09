import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import Alert from '../components/Alert.jsx'
import { requestPasswordReset } from '../services/authService.jsx'
import { isValidEmail } from '../utils/validation.jsx'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setStatus('loading')
    try {
      await requestPasswordReset(email)
    } catch (err) {
      // Intentionally ignore errors here (e.g. user-not-found) to avoid
      // revealing whether an email is registered.
    } finally {
      setStatus('sent')
    }
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <h1 className="font-display text-2xl font-semibold text-navy-900">Reset your password</h1>
        <p className="mt-1.5 text-sm text-navy-500">
          Enter your account email and we'll send you a link to reset your password.
        </p>

        {status === 'sent' ? (
          <Alert type="success" className="mt-6" title="Check your inbox">
            If an account exists for {email}, we've sent password reset instructions.
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
            <Button type="submit" variant="accent" className="w-full" loading={status === 'loading'}>
              Send reset link
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-navy-500">
          <Link to="/login" className="font-medium text-accent-600 hover:text-accent-700">Back to sign in</Link>
        </p>
      </Card>
    </div>
  )
}
