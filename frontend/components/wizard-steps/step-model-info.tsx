"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { WizardState } from "@/components/model-wizard"

interface StepModelInfoProps {
  state: WizardState
  onUpdate: (updates: Partial<WizardState>) => void
  onNext: () => void
  onPrev: () => void
}

export function StepModelInfo({ state, onUpdate, onNext, onPrev }: StepModelInfoProps) {
  const handleNext = () => {
    if (state.modelName.trim()) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="modelName" className="text-base font-semibold text-slate-100">
          Model Name
        </Label>
        <Input
          id="modelName"
          placeholder="e.g., Customer Churn Predictor"
          value={state.modelName}
          onChange={(e) => onUpdate({ modelName: e.target.value })}
          className="mt-2 bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/50"
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-base font-semibold text-slate-100">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Describe what your model will do..."
          value={state.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="mt-2 min-h-[120px] bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/50"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onPrev} className="border-slate-600 hover:bg-slate-800 bg-transparent">
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!state.modelName.trim()}
          className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/50 disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
