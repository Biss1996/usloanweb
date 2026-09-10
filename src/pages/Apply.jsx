import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

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

import {
  calculateRegistrationFee,
  FALLBACK_LOAN_CONFIG,
  getLoanConfig,
} from '../services/settingsService.jsx'

import {
  submitApplication,
} from '../services/applicationService.jsx'

import {
  clearApplicationDraft,
  loadApplicationDraft,
  saveApplicationDraft,
} from '../services/storageService.jsx'

import {
  isAdult,
  isRequired,
  isValidEmail,
  isValidMonthlyIncome,
  isValidUsPhone,
  isValidZip,
} from '../utils/validation.jsx'

import {
  US_STATES,
} from '../config/constants.jsx'

import {
  formatCurrency,
} from '../utils/formatters.jsx'

const STEP_LABELS = [
  'Loan Request',
  'Personal Information',
  'Address',
  'Employment',
  'Financial Overview',
  'Review',
]

const EMPTY_FORM = {
  loanAmount: 500,
  loanPurpose: '',
  loanTerm: 21,

  firstName: '',
  middleName: '',
  lastName: '',
  dateOfBirth: '',
  phone: '',
  email: '',

  street: '',
  apartment: '',
  city: '',
  state: '',
  zip: '',
  residenceType: '',
  timeAtAddress: '',

  employmentStatus: '',
  employerName: '',
  jobTitle: '',
  monthlyIncome: '',
  employmentDuration: '',
  payFrequency: '',

  finMonthlyIncome: '',
  monthlyHousingExpense: '',
  estimatedMonthlyExpenses: '',

  confirmAccurate: false,
}

function getSafeDraft(draft) {
  if (!draft || typeof draft !== 'object') {
    return null
  }

  return {
    loanAmount:
      Number(draft.loanAmount) ||
      EMPTY_FORM.loanAmount,

    loanPurpose:
      typeof draft.loanPurpose === 'string'
        ? draft.loanPurpose
        : '',

    loanTerm:
      Number(draft.loanTerm) ||
      EMPTY_FORM.loanTerm,
  }
}

function getSubmitError(error) {
  const messages = {
    'permission-denied':
      'Your application could not be submitted because access was denied. Please sign in again.',

    unauthenticated:
      'Your session has expired. Please sign in and try again.',

    unavailable:
      'The service is temporarily unavailable. Please wait a moment and try again.',

    'resource-exhausted':
      'The service is temporarily busy. Please try again shortly.',

    cancelled:
      'The request was interrupted. Please try again.',

    'deadline-exceeded':
      'The submission took too long. Please check your connection and try again.',
  }

  return (
    messages[error?.code] ||
    'We were unable to submit your application. Please try again.'
  )
}

export default function Apply() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [config, setConfig] = useState(
    FALLBACK_LOAN_CONFIG
  )

  const [configStatus, setConfigStatus] =
    useState('loading')

  const [step, setStep] = useState(1)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const [submitting, setSubmitting] =
    useState(false)

  const [submissionMessage, setSubmissionMessage] =
    useState('')

  const [submitError, setSubmitError] =
    useState('')

  /*
   * Load the loan configuration and restore only non-sensitive draft fields.
   */
  useEffect(() => {
    let active = true

    const storedDraft = getSafeDraft(
      loadApplicationDraft()
    )

    if (storedDraft) {
      setForm((currentForm) => ({
        ...currentForm,
        ...storedDraft,
      }))
    }

    getLoanConfig()
      .then((loanConfig) => {
        if (!active || !loanConfig) return

        setConfig(loanConfig)
        setConfigStatus('ready')

        setForm((currentForm) => {
          const increments = Array.isArray(
            loanConfig.loanIncrements
          )
            ? loanConfig.loanIncrements
            : []

          const selectedAmount = Number(
            currentForm.loanAmount
          )

          const nextAmount = increments.includes(
            selectedAmount
          )
            ? selectedAmount
            : increments[0] ||
              FALLBACK_LOAN_CONFIG.loanIncrements[0]

          const selectedTerm = Number(
            currentForm.loanTerm
          )

          const nextTerm = Math.min(
            Math.max(
              selectedTerm,
              Number(loanConfig.minimumTerm)
            ),
            Number(loanConfig.maximumTerm)
          )

          return {
            ...currentForm,
            loanAmount: nextAmount,
            loanTerm: nextTerm,
          }
        })
      })
      .catch((error) => {
        if (!active) return

        console.error(
          'Failed to load loan configuration:',
          error
        )

        setConfig(FALLBACK_LOAN_CONFIG)
        setConfigStatus('fallback')
      })

    return () => {
      active = false
    }
  }, [])

  /*
   * Save only non-sensitive selections.
   *
   * Do not store names, birth dates, addresses, phone numbers, email
   * addresses, employment information or income in localStorage.
   */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveApplicationDraft({
        loanAmount: form.loanAmount,
        loanPurpose: form.loanPurpose,
        loanTerm: form.loanTerm,
      })
    }, 500)

    return () => {
      window.clearTimeout(timer)
    }
  }, [
    form.loanAmount,
    form.loanPurpose,
    form.loanTerm,
  ])

  const update = (field) => (event) => {
    const value =
      event.target.type === 'checkbox'
        ? event.target.checked
        : event.target.value

    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))

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

    if (submitError) {
      setSubmitError('')
    }
  }

  const fee = useMemo(() => {
    return calculateRegistrationFee(
      Number(form.loanAmount),
      config
    )
  }, [
    config,
    form.loanAmount,
  ])

  const loanTermOptions = useMemo(() => {
    const minimum = Number(config.minimumTerm)
    const maximum = Number(config.maximumTerm)

    return Array.from(
      {
        length: Math.max(
          1,
          Math.floor(
            (maximum - minimum) / 7
          ) + 1
        ),
      },

      (_, index) => minimum + index * 7
    )
      .filter((term) => term <= maximum)
      .map((term) => [
        term,
        `${term} days`,
      ])
  }, [
    config.minimumTerm,
    config.maximumTerm,
  ])

  function validateStep(currentStep) {
    const nextErrors = {}

    if (currentStep === 1) {
      const amount = Number(form.loanAmount)

      if (
        !Number.isFinite(amount) ||
        amount < Number(config.minLoanAmount) ||
        amount > Number(config.maxLoanAmount)
      ) {
        nextErrors.loanAmount =
          'Please select a valid loan amount.'
      }

      if (!isRequired(form.loanPurpose)) {
        nextErrors.loanPurpose =
          'Please select a loan purpose.'
      }
    }

    if (currentStep === 2) {
      if (!isRequired(form.firstName)) {
        nextErrors.firstName = 'Required.'
      }

      if (!isRequired(form.lastName)) {
        nextErrors.lastName = 'Required.'
      }

      if (!isAdult(form.dateOfBirth)) {
        nextErrors.dateOfBirth =
          'You must be at least 18 years old.'
      }

      if (!isValidUsPhone(form.phone)) {
        nextErrors.phone =
          'Please enter a valid US phone number.'
      }

      if (!isValidEmail(form.email)) {
        nextErrors.email =
          'Please enter a valid email address.'
      }
    }

    if (currentStep === 3) {
      if (!isRequired(form.street)) {
        nextErrors.street = 'Required.'
      }

      if (!isRequired(form.city)) {
        nextErrors.city = 'Required.'
      }

      if (!isRequired(form.state)) {
        nextErrors.state = 'Required.'
      }

      if (!isValidZip(form.zip)) {
        nextErrors.zip =
          'Please enter a valid ZIP code.'
      }

      if (!isRequired(form.residenceType)) {
        nextErrors.residenceType = 'Required.'
      }

      if (!isRequired(form.timeAtAddress)) {
        nextErrors.timeAtAddress = 'Required.'
      }
    }

    if (currentStep === 4) {
      if (!isRequired(form.employmentStatus)) {
        nextErrors.employmentStatus = 'Required.'
      }

      if (
        !isValidMonthlyIncome(
          form.monthlyIncome
        )
      ) {
        nextErrors.monthlyIncome =
          'Please enter your monthly income.'
      }

      if (!isRequired(form.payFrequency)) {
        nextErrors.payFrequency = 'Required.'
      }
    }

    if (currentStep === 5) {
      if (
        !isValidMonthlyIncome(
          form.finMonthlyIncome ||
          form.monthlyIncome
        )
      ) {
        nextErrors.finMonthlyIncome =
          'Please enter your monthly income.'
      }

      if (
        !isRequired(
          form.monthlyHousingExpense
        )
      ) {
        nextErrors.monthlyHousingExpense =
          'Required.'
      }

      if (
        !isRequired(
          form.estimatedMonthlyExpenses
        )
      ) {
        nextErrors.estimatedMonthlyExpenses =
          'Required.'
      }
    }

    if (
      currentStep === 6 &&
      !form.confirmAccurate
    ) {
      nextErrors.confirmAccurate =
        'Please confirm your information is accurate.'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  const goNext = () => {
    if (submitting || !validateStep(step)) {
      return
    }

    setStep((currentStep) =>
      Math.min(
        currentStep + 1,
        STEP_LABELS.length
      )
    )

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const goBack = () => {
    if (submitting) return

    setStep((currentStep) =>
      Math.max(currentStep - 1, 1)
    )

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleSubmit = async () => {
    if (submitting) return

    if (!user?.uid) {
      navigate('/register', {
        state: {
          from: {
            pathname: '/apply',
          },
        },
      })

      return
    }

    if (!validateStep(6)) return

    setSubmitting(true)
    setSubmitError('')
    setSubmissionMessage(
      'Submitting your application securely…'
    )

    const startedAt = performance.now()

    const slowRequestTimer =
      window.setTimeout(() => {
        setSubmissionMessage(
          'Still working—please keep this page open while your application is submitted.'
        )
      }, 4000)

    try {
      console.time('application-submit')

      const result = await submitApplication({
        userId: user.uid,

        formData: {
          ...form,

          firstName: form.firstName.trim(),
          middleName: form.middleName.trim(),
          lastName: form.lastName.trim(),

          phone: form.phone.trim(),

          email: form.email
            .trim()
            .toLowerCase(),

          street: form.street.trim(),
          apartment: form.apartment.trim(),
          city: form.city.trim(),
          zip: form.zip.trim(),
        },

        loanConfig: config,
      })

      console.timeEnd('application-submit')

      const elapsedMilliseconds = Math.round(
        performance.now() - startedAt
      )

      console.info(
        `Application submitted in ${elapsedMilliseconds}ms`
      )

      clearApplicationDraft()

      navigate(
        `/dashboard/application/${result.id}`,
        {
          replace: true,

          state: {
            submitted: true,
            reference: result.reference,
          },
        }
      )
    } catch (error) {
      console.timeEnd('application-submit')

      console.error(
        'Application submission failed:',
        error?.code,
        error?.message,
        error
      )

      setSubmitError(
        getSubmitError(error)
      )

      setSubmissionMessage('')
      setSubmitting(false)
    } finally {
      window.clearTimeout(
        slowRequestTimer
      )
    }
  }

  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="font-display text-3xl font-semibold text-navy-900">
        Loan application
      </h1>

      <p className="mt-2 text-navy-500">
        Complete each step to submit your application.
        Non-sensitive loan selections are saved automatically.
      </p>

      {configStatus === 'loading' && (
        <p
          className="mt-3 text-xs text-navy-500"
          role="status"
        >
          Updating current loan options…
        </p>
      )}

      {configStatus === 'fallback' && (
        <Alert type="warning" className="mt-4">
          Current loan configuration could not be loaded.
          Displayed amounts may not be current.
        </Alert>
      )}

      <Card className="mt-8">
        <ApplicationStepper
          steps={STEP_LABELS}
          currentStep={step}
        />

        <div className="mt-8">
          {step === 1 && (
            <LoanRequestStep
              form={form}
              config={config}
              errors={errors}
              update={update}
              setForm={setForm}
              fee={fee}
              loanTermOptions={loanTermOptions}
            />
          )}

          {step === 2 && (
            <PersonalInformationStep
              form={form}
              errors={errors}
              update={update}
            />
          )}

          {step === 3 && (
            <AddressStep
              form={form}
              errors={errors}
              update={update}
            />
          )}

          {step === 4 && (
            <EmploymentStep
              form={form}
              errors={errors}
              update={update}
            />
          )}

          {step === 5 && (
            <FinancialStep
              form={form}
              errors={errors}
              update={update}
            />
          )}

          {step === 6 && (
            <ReviewStep
              form={form}
              config={config}
              fee={fee}
              errors={errors}
              update={update}
              setStep={setStep}
              user={user}
              submitting={submitting}
              submissionMessage={submissionMessage}
              submitError={submitError}
            />
          )}
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-navy-100 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={
              step === 1 ||
              submitting
            }
          >
            Back
          </Button>

          {step < STEP_LABELS.length ? (
            <Button
              type="button"
              variant="accent"
              onClick={goNext}
              disabled={submitting}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              variant="accent"
              onClick={handleSubmit}
              loading={submitting}
              disabled={submitting}
            >
              {submitting
                ? 'Submitting securely…'
                : 'Submit application'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

function LoanRequestStep({
  form,
  config,
  errors,
  update,
  setForm,
  fee,
  loanTermOptions,
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-navy-800">
          Loan amount
        </label>

        <LoanAmountSelector
          amounts={
            config.loanIncrements ||
            FALLBACK_LOAN_CONFIG.loanIncrements
          }
          value={Number(form.loanAmount)}
          onChange={(value) =>
            setForm((currentForm) => ({
              ...currentForm,
              loanAmount: value,
            }))
          }
        />

        {errors.loanAmount && (
          <p className="mt-1 text-xs font-medium text-red-600">
            {errors.loanAmount}
          </p>
        )}
      </div>

      <Select
        label="Loan purpose"
        required
        options={[
          ['auto_repair', 'Auto repair'],
          ['medical', 'Medical expense'],
          ['utility_bill', 'Utility bill'],
          ['rent', 'Rent'],
          ['emergency', 'Emergency expense'],
          ['other', 'Other'],
        ]}
        placeholder="Select a purpose"
        value={form.loanPurpose}
        onChange={update('loanPurpose')}
        error={errors.loanPurpose}
      />

      <Select
        label="Desired loan term"
        required
        options={loanTermOptions}
        value={form.loanTerm}
        onChange={update('loanTerm')}
      />

      <FeeDisclosure
        feeAmount={fee}
        feeThreshold={config.feeThreshold}
        smallFee={config.smallLoanFee}
        largeFee={config.largeLoanFee}
      />
    </div>
  )
}

function PersonalInformationStep({
  form,
  errors,
  update,
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Input
          label="First name"
          required
          value={form.firstName}
          onChange={update('firstName')}
          error={errors.firstName}
          autoComplete="given-name"
        />

        <Input
          label="Middle name (optional)"
          value={form.middleName}
          onChange={update('middleName')}
          autoComplete="additional-name"
        />

        <Input
          label="Last name"
          required
          value={form.lastName}
          onChange={update('lastName')}
          error={errors.lastName}
          autoComplete="family-name"
        />
      </div>

      <Input
        label="Date of birth"
        type="date"
        required
        value={form.dateOfBirth}
        onChange={update('dateOfBirth')}
        error={errors.dateOfBirth}
        autoComplete="bday"
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          label="Phone"
          type="tel"
          required
          value={form.phone}
          onChange={update('phone')}
          error={errors.phone}
          autoComplete="tel"
        />

        <Input
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={update('email')}
          error={errors.email}
          autoComplete="email"
        />
      </div>
    </div>
  )
}

function AddressStep({
  form,
  errors,
  update,
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Input
          label="Street address"
          required
          className="sm:col-span-2"
          value={form.street}
          onChange={update('street')}
          error={errors.street}
          autoComplete="street-address"
        />

        <Input
          label="Apartment (optional)"
          value={form.apartment}
          onChange={update('apartment')}
          autoComplete="address-line2"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Input
          label="City"
          required
          value={form.city}
          onChange={update('city')}
          error={errors.city}
          autoComplete="address-level2"
        />

        <Select
          label="State"
          required
          options={US_STATES}
          placeholder="Select state"
          value={form.state}
          onChange={update('state')}
          error={errors.state}
        />

        <Input
          label="ZIP code"
          required
          value={form.zip}
          onChange={update('zip')}
          error={errors.zip}
          autoComplete="postal-code"
          inputMode="numeric"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Select
          label="Residence type"
          required
          placeholder="Select type"
          options={[
            ['own', 'Own'],
            ['rent', 'Rent'],
            ['family', 'Living with family'],
            ['other', 'Other'],
          ]}
          value={form.residenceType}
          onChange={update('residenceType')}
          error={errors.residenceType}
        />

        <Select
          label="Time at address"
          required
          placeholder="Select range"
          options={[
            ['lt_1yr', 'Less than 1 year'],
            ['1_3yr', '1–3 years'],
            ['3_5yr', '3–5 years'],
            ['5yr_plus', '5+ years'],
          ]}
          value={form.timeAtAddress}
          onChange={update('timeAtAddress')}
          error={errors.timeAtAddress}
        />
      </div>
    </div>
  )
}

function EmploymentStep({
  form,
  errors,
  update,
}) {
  return (
    <div className="space-y-5">
      <Select
        label="Employment status"
        required
        placeholder="Select status"
        options={[
          ['employed', 'Employed'],
          ['self_employed', 'Self-employed'],
          ['unemployed', 'Unemployed'],
          ['retired', 'Retired'],
          ['military', 'Military'],
        ]}
        value={form.employmentStatus}
        onChange={update('employmentStatus')}
        error={errors.employmentStatus}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          label="Employer name"
          value={form.employerName}
          onChange={update('employerName')}
          autoComplete="organization"
        />

        <Input
          label="Job title"
          value={form.jobTitle}
          onChange={update('jobTitle')}
          autoComplete="organization-title"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Input
          label="Monthly income"
          type="number"
          required
          min="0"
          value={form.monthlyIncome}
          onChange={update('monthlyIncome')}
          error={errors.monthlyIncome}
          inputMode="decimal"
        />

        <Select
          label="Employment duration"
          placeholder="Select range"
          options={[
            ['lt_6mo', 'Less than 6 months'],
            ['6mo_2yr', '6 months – 2 years'],
            ['2yr_plus', '2+ years'],
          ]}
          value={form.employmentDuration}
          onChange={update('employmentDuration')}
        />

        <Select
          label="Pay frequency"
          required
          placeholder="Select frequency"
          options={[
            ['weekly', 'Weekly'],
            ['biweekly', 'Bi-weekly'],
            ['semimonthly', 'Semi-monthly'],
            ['monthly', 'Monthly'],
          ]}
          value={form.payFrequency}
          onChange={update('payFrequency')}
          error={errors.payFrequency}
        />
      </div>
    </div>
  )
}

function FinancialStep({
  form,
  errors,
  update,
}) {
  return (
    <div className="space-y-5">
      <Input
        label="Monthly income"
        type="number"
        required
        min="0"
        value={
          form.finMonthlyIncome ||
          form.monthlyIncome
        }
        onChange={update('finMonthlyIncome')}
        error={errors.finMonthlyIncome}
        inputMode="decimal"
      />

      <Input
        label="Monthly housing expense"
        type="number"
        required
        min="0"
        value={form.monthlyHousingExpense}
        onChange={update(
          'monthlyHousingExpense'
        )}
        error={errors.monthlyHousingExpense}
        inputMode="decimal"
      />

      <Input
        label="Estimated monthly expenses"
        type="number"
        required
        min="0"
        value={form.estimatedMonthlyExpenses}
        onChange={update(
          'estimatedMonthlyExpenses'
        )}
        error={
          errors.estimatedMonthlyExpenses
        }
        inputMode="decimal"
      />
    </div>
  )
}

function ReviewStep({
  form,
  config,
  fee,
  errors,
  update,
  setStep,
  user,
  submitting,
  submissionMessage,
  submitError,
}) {
  return (
    <div className="space-y-6">
      <ReviewSection
        title="Loan request"
        onEdit={() => setStep(1)}
        disabled={submitting}
      >
        <ReviewRow
          label="Amount"
          value={formatCurrency(
            form.loanAmount
          )}
        />

        <ReviewRow
          label="Purpose"
          value={form.loanPurpose}
        />

        <ReviewRow
          label="Term"
          value={`${form.loanTerm} days`}
        />
      </ReviewSection>

      <ReviewSection
        title="Personal information"
        onEdit={() => setStep(2)}
        disabled={submitting}
      >
        <ReviewRow
          label="Name"
          value={[
            form.firstName,
            form.middleName,
            form.lastName,
          ]
            .filter(Boolean)
            .join(' ')}
        />

        <ReviewRow
          label="Date of birth"
          value={form.dateOfBirth}
        />

        <ReviewRow
          label="Phone"
          value={form.phone}
        />

        <ReviewRow
          label="Email"
          value={form.email}
        />
      </ReviewSection>

      <ReviewSection
        title="Address"
        onEdit={() => setStep(3)}
        disabled={submitting}
      >
        <ReviewRow
          label="Address"
          value={[
            form.street,
            form.apartment,
            form.city,
            form.state,
            form.zip,
          ]
            .filter(Boolean)
            .join(', ')}
        />
      </ReviewSection>

      <ReviewSection
        title="Employment"
        onEdit={() => setStep(4)}
        disabled={submitting}
      >
        <ReviewRow
          label="Status"
          value={form.employmentStatus}
        />

        <ReviewRow
          label="Monthly income"
          value={formatCurrency(
            form.monthlyIncome
          )}
        />
      </ReviewSection>

      <FeeDisclosure
        feeAmount={fee}
        feeThreshold={config.feeThreshold}
        smallFee={config.smallLoanFee}
        largeFee={config.largeLoanFee}
      />

      <label className="flex items-start gap-3 rounded-xl bg-navy-50 p-4 text-sm text-navy-700">
        <input
          type="checkbox"
          checked={form.confirmAccurate}
          onChange={update('confirmAccurate')}
          disabled={submitting}
          className="mt-0.5 h-4 w-4 rounded border-navy-300 text-brand-600 focus:ring-brand-500"
        />

        <span>
          I confirm that the information provided is accurate.
        </span>
      </label>

      {errors.confirmAccurate && (
        <p
          className="text-xs font-medium text-red-600"
          role="alert"
        >
          {errors.confirmAccurate}
        </p>
      )}

      {!user && (
        <Alert type="info">
          You&apos;ll need an account to submit your
          application. We&apos;ll take you to create one next.
        </Alert>
      )}

      {submitting && submissionMessage && (
        <Alert type="info">
          {submissionMessage}
        </Alert>
      )}

      {submitError && (
        <Alert type="error">
          {submitError}
        </Alert>
      )}
    </div>
  )
}

function ReviewSection({
  title,
  onEdit,
  disabled = false,
  children,
}) {
  return (
    <div className="rounded-xl border border-navy-100 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-navy-900">
          {title}
        </h3>

        <button
          type="button"
          onClick={onEdit}
          disabled={disabled}
          className="text-xs font-medium text-accent-600 hover:text-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Edit
        </button>
      </div>

      <dl className="mt-3 space-y-1.5">
        {children}
      </dl>
    </div>
  )
}

function ReviewRow({
  label,
  value,
}) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-navy-500">
        {label}
      </dt>

      <dd className="text-right font-medium text-navy-800">
        {value || '—'}
      </dd>
    </div>
  )
}