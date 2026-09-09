import React, { useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Textarea from '../components/ui/Textarea.jsx'
import Button from '../components/ui/Button.jsx'
import Alert from '../components/Alert.jsx'
import { submitContactMessage } from '../services/contactService.jsx'
import { isValidEmail, isRequired } from '../utils/validation.jsx'
import { BRAND } from '../config/constants.jsx'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!isRequired(form.name)) next.name = 'Please enter your name.'
    if (!isValidEmail(form.email)) next.email = 'Please enter a valid email address.'
    if (!isRequired(form.subject)) next.subject = 'Please enter a subject.'
    if (!isRequired(form.message)) next.message = 'Please enter a message.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('loading')
    try {
      await submitContactMessage(form)
      setStatus('success')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <div className="container-page py-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h1 className="font-display text-4xl font-semibold text-navy-900">Contact us</h1>
          <p className="mt-4 text-navy-500">
            Have a question about an application, payment, or your account? Send us a message
            and our support team will follow up.
          </p>
          <div className="mt-8 space-y-3 text-sm text-navy-600">
            <p><span className="font-medium text-navy-900">Email:</span> {BRAND.supportEmail}</p>
            <p><span className="font-medium text-navy-900">Phone:</span> {BRAND.supportPhone}</p>
          </div>
        </div>

        <Card className="lg:col-span-3">
          {status === 'success' ? (
            <Alert type="success" title="Message sent">
              Thanks for reaching out — our support team will get back to you shortly.
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {status === 'error' && (
                <Alert type="error" title="Something went wrong">
                  We couldn't send your message. Please try again in a moment.
                </Alert>
              )}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input label="Name" name="name" required value={form.name} onChange={update('name')} error={errors.name} />
                <Input label="Email" name="email" type="email" required value={form.email} onChange={update('email')} error={errors.email} />
              </div>
              <Input label="Phone (optional)" name="phone" value={form.phone} onChange={update('phone')} />
              <Input label="Subject" name="subject" required value={form.subject} onChange={update('subject')} error={errors.subject} />
              <Textarea label="Message" name="message" required rows={5} value={form.message} onChange={update('message')} error={errors.message} />
              <Button type="submit" variant="accent" loading={status === 'loading'}>Send message</Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
