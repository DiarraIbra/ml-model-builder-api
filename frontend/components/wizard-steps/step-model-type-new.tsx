"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { ModelType, WizardState } from "@/components/model-wizard"
import { ArrowRight, Zap, TrendingUp } from "lucide-react"

interface StepModelTypeProps {
  state: WizardState
  onUpdate: (updates: Partial<WizardState>) => void
  onNext: () => void
  onPrev: () => void
}

export function StepModelTypeNew({ state, onUpdate, onNext, onPrev }: StepModelTypeProps) {
  const handleSelect = (type: ModelType) => {
    onUpdate({ modelType: type })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Choose Problem Type</h1>
          <p className="text-lg text-slate-400">What kind of predictions will your model make?</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Classification */}
          <Card
            onClick={() => handleSelect("classification")}
            className={`
              border-2 transition-all duration-300 cursor-pointer p-8
              ${
                state.modelType === "classification"
                  ? "border-purple-500 bg-gradient-to-br from-purple-500/20 to-pink-500/10 ring-2 ring-purple-300/50"
                  : "border-slate-700/50 bg-slate-900/40 hover:border-purple-500/50 hover:bg-slate-900/60"
              }
            `}
          >
            <div className="space-y-4">
              <div className="p-3 w-fit bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Classification</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Predict categories or classes. Examples: spam/not spam, cat/dog, high/medium/low risk.
                </p>
                <div className="text-xs text-slate-500">
                  <p>✓ Binary or multi-class</p>
                  <p>✓ Discrete outcomes</p>
                  <p>✓ Probability predictions</p>
                </div>
              </div>
              {state.modelType === "classification" && (
                <div className="pt-4 border-t border-purple-500/30 flex items-center gap-2 text-purple-300 font-semibold">
                  <div className="w-5 h-5 rounded-full bg-purple-500" />
                  Selected
                </div>
              )}
            </div>
          </Card>

          {/* Regression */}
          <Card
            onClick={() => handleSelect("regression")}
            className={`
              border-2 transition-all duration-300 cursor-pointer p-8
              ${
                state.modelType === "regression"
                  ? "border-pink-500 bg-gradient-to-br from-pink-500/20 to-purple-500/10 ring-2 ring-pink-300/50"
                  : "border-slate-700/50 bg-slate-900/40 hover:border-pink-500/50 hover:bg-slate-900/60"
              }
            `}
          >
            <div className="space-y-4">
              <div className="p-3 w-fit bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg">
                <TrendingUp className="w-8 h-8 text-pink-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Regression</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Predict continuous values. Examples: house prices, temperature, sales revenue.
                </p>
                <div className="text-xs text-slate-500">
                  <p>✓ Continuous output</p>
                  <p>✓ Numeric predictions</p>
                  <p>✓ Trend analysis</p>
                </div>
              </div>
              {state.modelType === "regression" && (
                <div className="pt-4 border-t border-pink-500/30 flex items-center gap-2 text-pink-300 font-semibold">
                  <div className="w-5 h-5 rounded-full bg-pink-500" />
                  Selected
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6">
          <Button
            variant="outline"
            onClick={onPrev}
            className="flex-1 h-11 border-slate-600 hover:bg-slate-800/50 text-slate-300 bg-transparent"
          >
            Back
          </Button>
          <Button
            onClick={onNext}
            className="flex-1 h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/50 gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
