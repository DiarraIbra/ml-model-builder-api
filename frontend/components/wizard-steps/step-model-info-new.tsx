"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import type { WizardState } from "@/components/model-wizard"

interface StepModelInfoProps {
  state: WizardState
  onUpdate: (updates: Partial<WizardState>) => void
  onNext: () => void
  onPrev: () => void
}

export function StepModelInfoNew({ state, onUpdate, onNext, onPrev }: StepModelInfoProps) {
  const handleNext = () => {
    if (state.modelName.trim()) {
      onNext()
    }
  }

  const [charCount, setCharCount] = React.useState(state.description.length)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Model Information</h1>
          <p className="text-lg text-slate-400">Let&apos;s start by giving your model a name and description</p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Model Name */}
          <div className="space-y-3">
            <Label htmlFor="modelName" className="text-base font-semibold text-slate-100">
              Model Name
            </Label>
            <Input
              id="modelName"
              placeholder="e.g., Customer Churn Predictor"
              value={state.modelName}
              onChange={(e) => onUpdate({ modelName: e.target.value })}
              className="h-12 bg-slate-900/60 border-slate-700/50 focus:border-purple-500/50 focus:ring-purple-500/20 text-slate-100 placeholder:text-slate-500 text-base"
            />
            <p className="text-xs text-slate-500">Choose a descriptive name for your model</p>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label htmlFor="description" className="text-base font-semibold text-slate-100">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what your model will do and its use case..."
              value={state.description}
              onChange={(e) => {
                onUpdate({ description: e.target.value })
                setCharCount(e.target.value.length)
              }}
              className="min-h-[150px] bg-slate-900/60 border-slate-700/50 focus:border-purple-500/50 focus:ring-purple-500/20 text-slate-100 placeholder:text-slate-500 text-base resize-none"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <p>Provide context for your model</p>
              <p>{charCount}/500 characters</p>
            </div>
          </div>

          {/* Model Type Preview */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-4">
            <p className="text-sm text-slate-400 mb-2">
              This model will be trained on your dataset to make predictions
            </p>
            <div className="flex gap-2">
              <div className="text-2xl">🤖</div>
              <div>
                <p className="text-sm font-semibold text-white">{state.modelName || "Your Model"}</p>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {state.description || "No description provided yet"}
                </p>
              </div>
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
            onClick={handleNext}
            disabled={!state.modelName.trim()}
            className="flex-1 h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/50 disabled:opacity-50 disabled:shadow-none gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

import React from "react"
