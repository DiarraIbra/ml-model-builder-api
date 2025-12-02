"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import Papa from "papaparse"
import { useEffect, useRef, useState } from "react"
import type { WizardState } from "@/components/model-wizard"

interface StepFeatureSelectionProps {
  state: WizardState
  onUpdate: (updates: Partial<WizardState>) => void
  onNext: () => void
  onPrev: () => void
}

export function StepFeatureSelection({ state, onUpdate, onNext, onPrev }: StepFeatureSelectionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current)
    }
  }, [])

  const startProgress = () => {
    setProgress(0)
    if (progressTimer.current) clearInterval(progressTimer.current)
    progressTimer.current = setInterval(() => {
      setProgress((p) => {
        const increment = Math.random() * 8 + 2 // 2 to 10%
        const next = p + increment
        return next >= 95 ? 95 : next
      })
    }, 400)
  }

  const stopProgress = (value = 100) => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current)
      progressTimer.current = null
    }
    setProgress(value)
  }

  const handleFeatureToggle = (column: string) => {
    const newFeatures = state.inputFeatures.includes(column)
      ? state.inputFeatures.filter((f) => f !== column)
      : [...state.inputFeatures, column]
    onUpdate({ inputFeatures: newFeatures })
  }

  const handleSelectAll = () => {
    if (state.inputFeatures.length === state.csvColumns.length - (state.outputTarget ? 1 : 0)) {
      onUpdate({ inputFeatures: [] })
    } else {
      const allFeatures = state.csvColumns.filter((col) => col !== state.outputTarget)
      onUpdate({ inputFeatures: allFeatures })
    }
  }

  const handleTargetChange = (column: string) => {
    const filteredFeatures = state.inputFeatures.filter((f) => f !== column)
    onUpdate({ outputTarget: column, inputFeatures: filteredFeatures })
  }

  const handleNext = async () => {
    setError(null)
    if (state.inputFeatures.length === 0 || !state.outputTarget) return

    try {
      setIsLoading(true)
      startProgress()

      const columns = state.csvColumns
      const rows = state.csvData && state.csvData.length > 0 ? state.csvData.slice(1) : []
      const csvString = Papa.unparse({ fields: columns, data: rows })

      const payload = {
        model_name: state.modelName,
        description: state.description,
        model_type: state.modelType,
        csv_data: csvString,
        input_features: state.inputFeatures,
        output_feature: state.outputTarget,
      }

      const parseRes = await fetch("http://localhost:5000/api/parse-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv_data: csvString }),
      })

      const parseData = await parseRes.json()
      if (!parseRes.ok || !parseData.success) {
        throw new Error(parseData.error || "Failed to parse CSV on server")
      }

      const serverColumns: string[] = parseData.columns || []
      const missingInputs = state.inputFeatures.filter((f) => !serverColumns.includes(f))
      const missingTarget = serverColumns.includes(state.outputTarget) ? null : state.outputTarget
      if (missingInputs.length > 0 || missingTarget) {
        const msgs: string[] = []
        if (missingInputs.length > 0) msgs.push(`Missing input columns: ${missingInputs.join(", ")}`)
        if (missingTarget) msgs.push(`Missing target column: ${missingTarget}`)
        throw new Error(msgs.join("; "))
      }

      const res = await fetch("http://localhost:5000/api/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Training failed on server")
      }

      const trainingResults = data.results.map((r: any) => ({
        algorithm: r.algorithm,
        metrics: r.metrics,
        score: r.score,
      }))

      onUpdate({
        trainingResults,
        bestAlgorithm: data.best_model,
        justification: data.justification,
        modelFile: data.model_file,
        reportFile: data.report_file,
      })
      stopProgress(100)
      onNext()
    } catch (err: any) {
      console.error("Training error:", err)
      setError(err.message || String(err))
      stopProgress(0)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-100">Input Features</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs h-7 px-2 text-purple-400 hover:bg-slate-700"
            >
              {state.inputFeatures.length === state.csvColumns.length - (state.outputTarget ? 1 : 0)
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>
          <p className="text-xs text-slate-400">Select columns to use as input features</p>
          <div className="space-y-2 border border-slate-700 rounded-lg p-3 bg-slate-800/30 max-h-64 overflow-y-auto">
            {state.csvColumns.map((column: string) => (
              <div key={column} className="flex items-center space-x-2">
                <Checkbox
                  id={`input-${column}`}
                  checked={state.inputFeatures.includes(column)}
                  onCheckedChange={() => handleFeatureToggle(column)}
                  disabled={state.outputTarget === column}
                  className="border-slate-600"
                />
                <Label htmlFor={`input-${column}`} className="text-sm cursor-pointer flex-1 font-normal text-slate-300">
                  {column}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-slate-100">Output Target</h3>
          <p className="text-xs text-slate-400">Select the column to predict</p>
          <RadioGroup
            value={state.outputTarget}
            onValueChange={handleTargetChange}
            className="border border-slate-700 rounded-lg p-3 bg-slate-800/30 max-h-64 overflow-y-auto space-y-2"
          >
            {state.csvColumns.map((column: string) => (
              <div key={column} className="flex items-center space-x-2">
                <RadioGroupItem value={column} id={`output-${column}`} className="border-slate-600" />
                <Label
                  htmlFor={`output-${column}`}
                  className="text-sm cursor-pointer flex-1 font-normal text-slate-300"
                >
                  {column}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      <div className="bg-linear-to-r from-purple-500/20 to-pink-500/10 border border-purple-500/50 rounded-lg p-4 backdrop-blur">
        <p className="text-sm text-slate-100">
          <span className="font-semibold text-purple-300">Selected features:</span>{" "}
          {state.inputFeatures.length > 0 ? state.inputFeatures.join(", ") : "None"}
        </p>
        <p className="text-sm text-slate-100 mt-1">
          <span className="font-semibold text-purple-300">Target:</span> {state.outputTarget || "Not selected"}
        </p>
      </div>

      <div>
        {error && <p className="text-red-400 text-sm mb-2">Error: {error}</p>}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onPrev} className="border-slate-600 hover:bg-slate-800 bg-transparent">
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={isLoading || state.inputFeatures.length === 0 || !state.outputTarget}
            className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/50 disabled:opacity-50"
          >
            {isLoading ? "Training..." : "Train Model"}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 rounded-xl bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6 border border-slate-800">
          <div className="text-slate-100 font-semibold">Entraînement en cours...</div>
          <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-slate-300">{Math.min(100, Math.round(progress))}%</div>
        </div>
      )}
    </div>
  )
}
