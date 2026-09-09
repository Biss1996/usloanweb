import React from 'react'

export default function ApplicationStepper({ steps, currentStep }) {
  return (
    <div>
      <ol className="flex items-center gap-2 sm:gap-3">
        {steps.map((label, i) => {
          const stepNum = i + 1
          const state = stepNum < currentStep ? 'done' : stepNum === currentStep ? 'active' : 'upcoming'
          return (
            <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3">
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  state === 'done'
                    ? 'bg-brand-500 text-white'
                    : state === 'active'
                    ? 'bg-navy-900 text-white'
                    : 'bg-navy-100 text-navy-400'
                }`}
              >
                {state === 'done' ? (
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                    <path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4L8.5 12l6.8-6.8a1 1 0 011.4 0z" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              {stepNum < steps.length && (
                <div className={`h-0.5 flex-1 rounded ${state === 'done' ? 'bg-brand-400' : 'bg-navy-100'}`} />
              )}
            </li>
          )
        })}
      </ol>
      <p className="mt-3 text-sm font-medium text-navy-700">
        Step {currentStep} of {steps.length}: <span className="text-navy-900">{steps[currentStep - 1]}</span>
      </p>
    </div>
  )
}
