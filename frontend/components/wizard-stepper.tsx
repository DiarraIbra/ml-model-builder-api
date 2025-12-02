"use client"

import { Check } from "lucide-react"

interface StepperProps {
  steps: string[]
  currentStep: number
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center gap-2 md:gap-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-2 md:gap-4">
          {/* Step circle */}
          <div
            className={`
              flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full font-semibold transition-all duration-300
              ${
                index < currentStep
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  : index === currentStep
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white ring-2 ring-purple-300/50"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
              }
            `}
          >
            {index < currentStep ? <Check className="w-5 h-5" /> : <span className="text-sm">{index + 1}</span>}
          </div>

          {/* Step label */}
          <div className="hidden md:block">
            <p
              className={`text-sm font-medium transition-colors ${
                index <= currentStep ? "text-white" : "text-slate-500"
              }`}
            >
              {step}
            </p>
          </div>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={`hidden md:block h-1 w-12 rounded-full transition-all duration-300 ${
                index < currentStep ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-slate-700"
              }`}
            ></div>
          )}
        </div>
      ))}
    </div>
  )
}
