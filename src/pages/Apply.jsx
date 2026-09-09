import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Select from '../components/ui/Select.jsx'
import Button from '../components/ui/Button.jsx'
import Alert from '../components/Alert.jsx'
import ApplicationStepper from '../components/ApplicationStepper.jsx'
import LoanAmountSelector from '../components/LoanAmountSelector.jsx'
import FeeDisclosure from '../components/FeeDisclosure.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { getLoanConfig, calculateRegistrationFee, FALLBACK_LOAN_CONFIG } from '../services/settingsService.jsx'
import { submitApplication } from '../services/applicationService.jsx'
import { saveApplicationDraft, loadApplicationDraft, clearApplicationDraft } from '../services/storageService.jsx'
import { isRequired, isValidEmail, isValidUsPhone, isValidZip, isAdult, isValidMonthlyIncome } from '../utils/validation.jsx'
import { US_STATES } from '../config/constants.jsx'
import { formatCurrency } from '../utils/formatters.jsx'

const STEP_LABELS = ['Loan Request', 'Personal Information', 'Address', 'Employment', 'Financial Overview', 'Review']

const EMPTY_FORM = {
  loanAmount: 500, loanPurpose: '', loanTerm: 21,
  firstName: '', middleName: '', lastName: '', dateOfBirth: '', phone: '', email: '',
  street: '', apartment: '', city: '', state: '', zip: '', residenceType: '', timeAtAddress: '',
  employmentStatus: '', employerName: '', jobTitle: '', monthlyIncome: '', employmentDuration: '', payFrequency: '',
  finMonthlyIncome: '', monthlyHousingExpense: '', estimatedMonthlyExpenses: '',
  confirmAccurate: false,
}

export default function Apply() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [config, setConfig] = useState(FALLBACK_LOAN_CONFIG)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

 useEffect(() => {
  // Render immediately with sensible fallback defaults (same ones used
  // elsewhere in the app) rather than blocking the whole page behind this
  // fetch — swap in the real, admin-configured values once they arrive.
  getLoanConfig().then(setConfig).catch(() => {})
  const draft = loadApplicationDraft()
  if (draft) setForm((f) => ({ ...f, ...draft }))
}, [])

  useEffect(() => {
    const { confirmAccurate, ...draftable } = form
    saveApplicationDraft(draftable)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: value }))
  }

  const fee = useMemo(() => (config ? calculateRegistrationFee(Number(form.loanAmount), config) : 0), [config, form.loanAmount])

  function validateStep(current) {
    const next = {}
    if (current === 1) {
      if (!config || Number(form.loanAmount) < config.minLoanAmount || Number(form.loanAmount) > config.maxLoanAmount) {
        next.loanAmount = 'Please select a valid loan amount.'
      }
      if (!isRequired(form.loanPurpose)) next.loanPurpose = 'Please select a loan purpose.'
    }
    if (current === 2) {
      if (!isRequired(form.firstName)) next.firstName = 'Required.'
      if (!isRequired(form.lastName)) next.lastName = 'Required.'
      if (!isAdult(form.dateOfBirth)) next.dateOfBirth = 'You must be at least 18 years old.'
      if (!isValidUsPhone(form.phone)) next.phone = 'Please enter a valid US phone number.'
      if (!isValidEmail(form.email)) next.email = 'Please enter a valid email address.'
    }
    if (current === 3) {
      if (!isRequired(form.street)) next.street = 'Required.'
      if (!isRequired(form.city)) next.city = 'Required.'
      if (!isRequired(form.state)) next.state = 'Required.'
      if (!isValidZip(form.zip)) next.zip = 'Please enter a valid ZIP code.'
      if (!isRequired(form.residenceType)) next.residenceType = 'Required.'
      if (!isRequired(form.timeAtAddress)) next.timeAtAddress = 'Required.'
    }
    if (current === 4) {
      if (!isRequired(form.employmentStatus)) next.employmentStatus = 'Required.'
      if (!isValidMonthlyIncome(form.monthlyIncome)) next.monthlyIncome = 'Please enter your monthly income.'
      if (!isRequired(form.payFrequency)) next.payFrequency = 'Required.'
    }
    if (current === 5) {
      if (!isValidMonthlyIncome(form.finMonthlyIncome || form.monthlyIncome)) next.finMonthlyIncome = 'Please enter your monthly income.'
      if (!isRequired(form.monthlyHousingExpense)) next.monthlyHousingExpense = 'Required.'
      if (!isRequired(form.estimatedMonthlyExpenses)) next.estimatedMonthlyExpenses = 'Required.'
    }
    if (current === 6) {
      if (!form.confirmAccurate) next.confirmAccurate = 'Please confirm your information is accurate.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const goNext = () => {
    if (!validateStep(step)) return
    setStep((s) => Math.min(s + 1, STEP_LABELS.length))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const goBack = () => {
    setStep((s) => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!user) {
      navigate('/register', { state: { from: { pathname: '/apply' } } })
      return
    }
    if (!validateStep(6)) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const { id } = await submitApplication({ userId: user.uid, formData: form, loanConfig: config })
      clearApplicationDraft()
      navigate(`/dashboard/application/${id}`)
    } catch (err) {
      setSubmitError('We were unable to submit your application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }


  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="font-display text-3xl font-semibold text-navy-900">Loan application</h1>
      <p className="mt-2 text-navy-500">Complete each step — your progress is saved automatically as you go.</p>

      <Card className="mt-8">
        <ApplicationStepper steps={STEP_LABELS} currentStep={step} />

        <div className="mt-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-navy-800">Loan amount</label>
                <LoanAmountSelector amounts={config.loanIncrements} value={Number(form.loanAmount)} onChange={(v) => setForm((f) => ({ ...f, loanAmount: v }))} />
                {errors.loanAmount && <p className="mt-1 text-xs font-medium text-red-600">{errors.loanAmount}</p>}
              </div>
              <Select
                label="Loan purpose" required options={[
                  ['auto_repair', 'Auto repair'], ['medical', 'Medical expense'], ['utility_bill', 'Utility bill'],
                  ['rent', 'Rent'], ['emergency', 'Emergency expense'], ['other', 'Other'],
                ]}
                placeholder="Select a purpose" value={form.loanPurpose} onChange={update('loanPurpose')} error={errors.loanPurpose}
              />
              <Select
                label="Desired loan term" required
                options={Array.from(
                  { length: Math.max(1, Math.floor((config.maximumTerm - config.minimumTerm) / 7) + 1) },
                  (_, i) => config.minimumTerm + i * 7
                ).filter((t) => t <= config.maximumTerm).map((t) => [t, `${t} days`])}
                value={form.loanTerm} onChange={update('loanTerm')}
              />
              <FeeDisclosure
                feeAmount={fee} feeThreshold={config.feeThreshold}
                smallFee={config.smallLoanFee} largeFee={config.largeLoanFee}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <Input label="First name" required value={form.firstName} onChange={update('firstName')} error={errors.firstName} />
                <Input label="Middle name (optional)" value={form.middleName} onChange={update('middleName')} />
                <Input label="Last name" required value={form.lastName} onChange={update('lastName')} error={errors.lastName} />
              </div>
              <Input label="Date of birth" type="date" required value={form.dateOfBirth} onChange={update('dateOfBirth')} error={errors.dateOfBirth} />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input label="Phone" type="tel" required value={form.phone} onChange={update('phone')} error={errors.phone} />
                <Input label="Email" type="email" required value={form.email} onChange={update('email')} error={errors.email} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <Input label="Street address" required className="sm:col-span-2" value={form.street} onChange={update('street')} error={errors.street} />
                <Input label="Apartment (optional)" value={form.apartment} onChange={update('apartment')} />
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <Input label="City" required value={form.city} onChange={update('city')} error={errors.city} />
                <Select label="State" required options={US_STATES} placeholder="Select state" value={form.state} onChange={update('state')} error={errors.state} />
                <Input label="ZIP code" required value={form.zip} onChange={update('zip')} error={errors.zip} />
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Select
                  label="Residence type" required placeholder="Select type"
                  options={[['own', 'Own'], ['rent', 'Rent'], ['family', 'Living with family'], ['other', 'Other']]}
                  value={form.residenceType} onChange={update('residenceType')} error={errors.residenceType}
                />
                <Select
                  label="Time at address" required placeholder="Select range"
                  options={[['lt_1yr', 'Less than 1 year'], ['1_3yr', '1–3 years'], ['3_5yr', '3–5 years'], ['5yr_plus', '5+ years']]}
                  value={form.timeAtAddress} onChange={update('timeAtAddress')} error={errors.timeAtAddress}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <Select
                label="Employment status" required placeholder="Select status"
                options={[['employed', 'Employed'], ['self_employed', 'Self-employed'], ['unemployed', 'Unemployed'], ['retired', 'Retired'], ['military', 'Military']]}
                value={form.employmentStatus} onChange={update('employmentStatus')} error={errors.employmentStatus}
              />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input label="Employer name" value={form.employerName} onChange={update('employerName')} />
                <Input label="Job title" value={form.jobTitle} onChange={update('jobTitle')} />
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <Input label="Monthly income" type="number" required value={form.monthlyIncome} onChange={update('monthlyIncome')} error={errors.monthlyIncome} />
                <Select
                  label="Employment duration" placeholder="Select range"
                  options={[['lt_6mo', 'Less than 6 months'], ['6mo_2yr', '6 months – 2 years'], ['2yr_plus', '2+ years']]}
                  value={form.employmentDuration} onChange={update('employmentDuration')}
                />
                <Select
                  label="Pay frequency" required placeholder="Select frequency"
                  options={[['weekly', 'Weekly'], ['biweekly', 'Bi-weekly'], ['semimonthly', 'Semi-monthly'], ['monthly', 'Monthly']]}
                  value={form.payFrequency} onChange={update('payFrequency')} error={errors.payFrequency}
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <Input label="Monthly income" type="number" required value={form.finMonthlyIncome || form.monthlyIncome} onChange={update('finMonthlyIncome')} error={errors.finMonthlyIncome} />
              <Input label="Monthly housing expense" type="number" required value={form.monthlyHousingExpense} onChange={update('monthlyHousingExpense')} error={errors.monthlyHousingExpense} />
              <Input label="Estimated monthly expenses" type="number" required value={form.estimatedMonthlyExpenses} onChange={update('estimatedMonthlyExpenses')} error={errors.estimatedMonthlyExpenses} />
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <ReviewSection title="Loan request" onEdit={() => setStep(1)}>
                <ReviewRow label="Amount" value={formatCurrency(form.loanAmount)} />
                <ReviewRow label="Purpose" value={form.loanPurpose} />
                <ReviewRow label="Term" value={`${form.loanTerm} days`} />
              </ReviewSection>
              <ReviewSection title="Personal information" onEdit={() => setStep(2)}>
                <ReviewRow label="Name" value={`${form.firstName} ${form.middleName} ${form.lastName}`} />
                <ReviewRow label="Date of birth" value={form.dateOfBirth} />
                <ReviewRow label="Phone" value={form.phone} />
                <ReviewRow label="Email" value={form.email} />
              </ReviewSection>
              <ReviewSection title="Address" onEdit={() => setStep(3)}>
                <ReviewRow label="Address" value={`${form.street} ${form.apartment}, ${form.city}, ${form.state} ${form.zip}`} />
              </ReviewSection>
              <ReviewSection title="Employment" onEdit={() => setStep(4)}>
                <ReviewRow label="Status" value={form.employmentStatus} />
                <ReviewRow label="Monthly income" value={formatCurrency(form.monthlyIncome)} />
              </ReviewSection>

              <FeeDisclosure feeAmount={fee} feeThreshold={config.feeThreshold} smallFee={config.smallLoanFee} largeFee={config.largeLoanFee} />

              <label className="flex items-start gap-3 rounded-xl bg-navy-50 p-4 text-sm text-navy-700">
                <input type="checkbox" checked={form.confirmAccurate} onChange={update('confirmAccurate')} className="mt-0.5 h-4 w-4 rounded border-navy-300 text-brand-600 focus:ring-brand-500" />
                <span>I confirm that the information provided is accurate.</span>
              </label>
              {errors.confirmAccurate && <p className="text-xs font-medium text-red-600">{errors.confirmAccurate}</p>}

              {!user && (
                <Alert type="info">
                  You'll need an account to submit your application — we'll take you to create one next.
                </Alert>
              )}
              {submitError && <Alert type="error">{submitError}</Alert>}
            </div>
          )}
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-navy-100 pt-6">
          <Button variant="outline" onClick={goBack} disabled={step === 1}>Back</Button>
          {step < STEP_LABELS.length ? (
            <Button variant="accent" onClick={goNext}>Continue</Button>
          ) : (
            <Button variant="accent" onClick={handleSubmit} loading={submitting}>Submit application</Button>
          )}
        </div>
      </Card>
    </div>
  )
}

function ReviewSection({ title, onEdit, children }) {
  return (
    <div className="rounded-xl border border-navy-100 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-navy-900">{title}</h3>
        <button onClick={onEdit} className="text-xs font-medium text-accent-600 hover:text-accent-700">Edit</button>
      </div>
      <dl className="mt-3 space-y-1.5">{children}</dl>
    </div>
  )
}
function ReviewRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-navy-500">{label}</dt>
      <dd className="text-right font-medium text-navy-800">{value || '—'}</dd>
    </div>
  )
}
