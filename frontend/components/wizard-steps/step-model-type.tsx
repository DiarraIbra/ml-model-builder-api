"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { WizardState, ModelType } from "@/components/model-wizard"

interface StepModelTypeProps {
  state: WizardState
  onUpdate: (updates: Partial<WizardState>) => void
  onNext: () => void
  onPrev: () => void
}

export function StepModelType({ state, onUpdate, onNext, onPrev }: StepModelTypeProps) {
  const models = [
    {
      id: "classification" as ModelType,
      title: "Classification",
      description: "Predict categories or classes (e.g., spam or not spam)",
    },
    {
      id: "regression" as ModelType,
      title: "Regression",
      description: "Predict continuous values (e.g., price, temperature)",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold bg-linear-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-4">
          Select Model Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((model) => (
            <Card
              key={model.id}
              className={`p-6 cursor-pointer transition-all duration-300 border-2 backdrop-blur ${
                state.modelType === model.id
                  ? "border-purple-500 bg-linear-to-br from-purple-500/30 to-pink-500/20 shadow-lg shadow-purple-500/50"
                  : "border-slate-700 hover:border-purple-500/50 bg-slate-800/50 hover:bg-slate-800"
              }`}
              onClick={() => onUpdate({ modelType: model.id })}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      state.modelType === model.id
                        ? "border-purple-400 bg-linear-to-br from-purple-500 to-pink-500"
                        : "border-slate-600 hover:border-purple-500"
                    }`}
                  >
                    {state.modelType === model.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-100">{model.title}</p>
                  <p className="text-sm text-slate-400">{model.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onPrev} className="border-slate-600 hover:bg-slate-800 bg-transparent">
          Back
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/50"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
