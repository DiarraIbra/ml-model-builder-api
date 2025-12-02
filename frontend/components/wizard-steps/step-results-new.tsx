"use client"

import { useState } from "react"
import { TrainingProgressScreen } from "@/components/training-progress-screen"
import { Button } from "@/components/ui/button"
import { Download, Home } from "lucide-react"
import type { WizardState } from "@/components/model-wizard"

interface StepResultsProps {
  state: WizardState
  onNewModel: () => void
}

export function StepResultsNew({ state, onNewModel }: StepResultsProps) {
  const [showResults, setShowResults] = useState(false)

  return (
    <>
      {!showResults ? (
        <TrainingProgressScreen onComplete={() => setShowResults(true)} />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 py-12 px-6">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-white">Training Complete!</h1>
              <p className="text-lg text-slate-400">Your model is ready to use</p>
            </div>

            {/* Model Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <ResultCard label="Model Name" value={state.modelName} />
              <ResultCard label="Type" value={state.modelType === "classification" ? "Classification" : "Regression"} />
              <ResultCard label="Accuracy" value="94.2%" />
              <ResultCard label="Status" value="Active" highlight />
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap justify-center">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/50 gap-2">
                <Download className="w-4 h-4" />
                View Model Details
              </Button>
              <Button
                variant="outline"
                onClick={onNewModel}
                className="border-slate-600 hover:bg-slate-800/50 gap-2 bg-transparent"
              >
                <Home className="w-4 h-4" />
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function ResultCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`
      rounded-lg p-6 border text-center
      ${
        highlight
          ? "bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-green-500/30"
          : "bg-slate-900/40 border-slate-700/50"
      }
    `}
    >
      <p className="text-sm text-slate-400 mb-2">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? "text-green-400" : "text-white"}`}>{value}</p>
    </div>
  )
}
