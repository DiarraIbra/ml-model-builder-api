"use client"

import { useState } from "react"
import { Stepper } from "./wizard-stepper"
import { StepModelInfoNew } from "./wizard-steps/step-model-info-new"
import { StepDataUploadNew } from "./wizard-steps/step-data-upload-new"
import { StepModelTypeNew } from "./wizard-steps/step-model-type-new"
import { StepFeatureSelection } from "./wizard-steps/step-feature-selection"
import { StepResults } from "./wizard-steps/step-results"
import type { WizardState } from "./model-wizard"

export type { ModelType, WizardState, TrainingResult } from "./model-wizard"

interface ModelWizardNewProps {
  isOpen: boolean
  onClose: () => void
}

export function ModelWizardNew({ isOpen, onClose }: ModelWizardNewProps) {
  const [step, setStep] = useState(1)
  const [wizardState, setWizardState] = useState<WizardState>({
    modelName: "",
    description: "",
    csvData: [],
    csvColumns: [],
    modelType: "classification",
    inputFeatures: [],
    outputTarget: "",
    trainingResults: [],
    justification: "",
    modelFile: null,
    reportFile: null,
  })

  const updateWizardState = (updates: Partial<WizardState>) => {
    setWizardState((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (step < 5) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      onClose()
    }
  }

  const steps = ["Model Info", "Upload Data", "Problem Type", "Select Features", "Train Model"]

  const resetWizard = () => {
    setStep(1)
    setWizardState({
      modelName: "",
      description: "",
      csvData: [],
      csvColumns: [],
      modelType: "classification",
      inputFeatures: [],
      outputTarget: "",
      trainingResults: [],
      justification: "",
      modelFile: null,
      reportFile: null,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Stepper steps={steps} currentStep={step} />
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[calc(100vh-80px)]">
        {step === 1 && (
          <StepModelInfoNew state={wizardState} onUpdate={updateWizardState} onNext={nextStep} onPrev={prevStep} />
        )}
        {step === 2 && (
          <StepDataUploadNew state={wizardState} onUpdate={updateWizardState} onNext={nextStep} onPrev={prevStep} />
        )}
        {step === 3 && (
          <StepModelTypeNew state={wizardState} onUpdate={updateWizardState} onNext={nextStep} onPrev={prevStep} />
        )}
        {step === 4 && (
          <div className="max-w-6xl mx-auto px-6 py-8">
            <StepFeatureSelection
              state={wizardState}
              onUpdate={updateWizardState}
              onNext={nextStep}
              onPrev={prevStep}
            />
          </div>
        )}
        {step === 5 && (
          <div className="max-w-6xl mx-auto px-6 py-8">
            <StepResults state={wizardState} onPrev={prevStep} onNext={nextStep} onNewModel={resetWizard} />
          </div>
        )}
      </div>
    </div>
  )
}
