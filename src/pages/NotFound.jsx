import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-display text-6xl font-semibold text-navy-900">404</p>
      <h1 className="mt-3 text-xl font-semibold text-navy-800">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-navy-500">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Button as={Link} to="/" variant="accent" className="mt-6">Back to home</Button>
    </div>
  )
}
