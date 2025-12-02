"use client"

import { useState } from "react"
import { Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LandingPage } from "./wizard-steps/landing-page"
import { StepModelInfo } from "./wizard-steps/step-model-info"
import { StepDataUpload } from "./wizard-steps/step-data-upload"
import { StepModelType } from "./wizard-steps/step-model-type"
import { StepFeatureSelection } from "./wizard-steps/step-feature-selection"
import { StepResults } from "./wizard-steps/step-results"

export type ModelType = "classification" | "regression"

export interface WizardState {
  modelName: string
  description: string
  csvData: string[][]
  csvColumns: string[]
  modelType: ModelType
  inputFeatures: string[]
  outputTarget: string
  trainingResults: TrainingResult[]
  bestAlgorithm?: string
  justification?: string
  modelFile?: string | null
  reportFile?: string | null
}

export interface TrainingResult {
  algorithm: string
  metrics: {
    [key: string]: number
  }
  score?: number
}

interface ModelWizardProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function ModelWizard({ isOpen, onOpenChange }: ModelWizardProps) {
  const [step, setStep] = useState(0)
  const [wizardState, setWizardState] = useState<WizardState>({
    modelName: "",
    description: "",
    csvData: [],
    csvColumns: [],
    modelType: "classification",
    inputFeatures: [],
    outputTarget: "",
    trainingResults: [],
    bestAlgorithm: "",
    justification: "",
    modelFile: null,
    reportFile: null,
  })

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStep(0)
      setWizardState({
        modelName: "",
        description: "",
        csvData: [],
        csvColumns: [],
        modelType: "classification",
        inputFeatures: [],
        outputTarget: "",
        trainingResults: [],
        bestAlgorithm: "",
        modelFile: null,
        reportFile: null,
      })
    }
    onOpenChange(open)
  }

  const updateWizardState = (updates: Partial<WizardState>) => {
    setWizardState((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => setStep((prev) => prev + 1)
  const prevStep = () => setStep((prev) => Math.max(0, prev - 1))

  const steps = [
    <LandingPage key="landing" />,
    <StepModelInfo
      key="model-info"
      state={wizardState}
      onUpdate={updateWizardState}
      onNext={nextStep}
      onPrev={prevStep}
    />,
    <StepDataUpload
      key="data-upload"
      state={wizardState}
      onUpdate={updateWizardState}
      onNext={nextStep}
      onPrev={prevStep}
    />,
    <StepModelType
      key="model-type"
      state={wizardState}
      onUpdate={updateWizardState}
      onNext={nextStep}
      onPrev={prevStep}
    />,
    <StepFeatureSelection
      key="feature-selection"
      state={wizardState}
      onUpdate={updateWizardState}
      onNext={nextStep}
      onPrev={prevStep}
    />,
    <StepResults
      key="results"
      state={wizardState}
      onNext={nextStep}
      onPrev={prevStep}
      onNewModel={() => handleOpenChange(false)}
    />,
  ]

  return (
    <div>
      {step === 0 && (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-blue-950 to-purple-950 relative overflow-hidden">
          {/* Animated gradient orbs */}
          <div className="absolute top-20 right-20 w-72 h-72 bg-linear-to-br from-purple-600 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-linear-to-br from-blue-600 to-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-linear-to-br from-pink-600 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

          <div className="relative z-10 text-center max-w-2xl px-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-200">AI-Powered ML Model Builder</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold bg-linear-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent mb-6">
              Build ML Models with Ease
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Create, train, and deploy machine learning models without writing a single line of code. Powered by
              cutting-edge algorithms.
            </p>
            <Button
              onClick={() => {
                setStep(1)
                onOpenChange(true)
              }}
              size="lg"
              className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Model
            </Button>
          </div>
        </div>
      )}

      {step > 0 && (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 bg-linear-to-b from-slate-900 to-slate-950 border border-purple-500/30">
            <div className="overflow-y-auto flex-1">
              <div className="px-6 pt-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl bg-linear-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                    Step {step} of {steps.length - 1}
                  </DialogTitle>
                </DialogHeader>
              </div>
              <div className="px-6 py-4">{steps[step]}</div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
