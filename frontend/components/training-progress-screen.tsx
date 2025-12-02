"use client"

import { useEffect, useState } from "react"
import { Training3DAnimation } from "./training-3d-animation"
import { CheckCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TrainingProgressScreenProps {
  onComplete: () => void
}

const trainingPhases = [
  { label: "Preprocessing des données", min: 0, max: 25 },
  { label: "Entraînement du modèle", min: 25, max: 70 },
  { label: "Validation des résultats", min: 70, max: 90 },
  { label: "Finalisation", min: 90, max: 100 },
]

export function TrainingProgressScreen({ onComplete }: TrainingProgressScreenProps) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(0)

  useEffect(() => {
    if (isComplete) return

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 3
        if (newProgress >= 100) {
          clearInterval(timer)
          setIsComplete(true)
          setProgress(100)
          return 100
        }

        // Update phase
        for (let i = 0; i < trainingPhases.length; i++) {
          if (newProgress >= trainingPhases[i].min && newProgress < trainingPhases[i].max) {
            setCurrentPhase(i)
            break
          }
        }

        return newProgress
      })
    }, 500)

    return () => clearInterval(timer)
  }, [isComplete])

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 overflow-hidden flex flex-col items-center justify-center px-6">
      {/* 3D Background Animation */}
      <div className="absolute inset-0">
        <Training3DAnimation isComplete={isComplete} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md space-y-8 text-center">
        {/* Success State - appears at end */}
        {isComplete && (
          <div className="space-y-6 animate-fade-in">
            {/* Checkmark */}
            <div className="flex justify-center">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse"></div>
                <div className="absolute inset-2 rounded-full bg-slate-950 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-400" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text">
                Training Complete!
              </h2>
              <p className="text-lg text-slate-300">Your model has been trained successfully with 94.2% accuracy</p>
            </div>

            {/* Results preview */}
            <div className="grid grid-cols-3 gap-4 bg-slate-900/40 backdrop-blur border border-slate-700/50 rounded-lg p-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Accuracy</p>
                <p className="text-lg font-bold text-green-400">94.2%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Precision</p>
                <p className="text-lg font-bold text-blue-400">88.5%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">F1-Score</p>
                <p className="text-lg font-bold text-purple-400">89.4%</p>
              </div>
            </div>

            <Button
              onClick={onComplete}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg shadow-green-500/50 text-lg font-semibold gap-2"
            >
              <Sparkles className="w-5 h-5" />
              View Results
            </Button>
          </div>
        )}

        {/* Training State */}
        {!isComplete && (
          <div className="space-y-8">
            {/* Progress animation */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">Training Your Model</h2>
              <p className="text-slate-400">This may take a few moments. Please don&apos;t close this window.</p>
            </div>

            {/* Progress bar */}
            <div className="space-y-3">
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 transition-all duration-300 rounded-full shadow-lg shadow-purple-500/50"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="text-sm text-slate-400">{Math.round(progress)}%</span>
                <span className="text-sm text-slate-500 animate-pulse">Processing...</span>
              </div>
            </div>

            {/* Current phase */}
            <div className="bg-slate-900/40 backdrop-blur border border-slate-700/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                <p className="text-sm font-medium text-slate-200">{trainingPhases[currentPhase].label}</p>
              </div>

              {/* Animated dots */}
              <div className="flex gap-2 justify-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-purple-500"
                    style={{
                      animation: `pulse 1.5s infinite ${i * 0.2}s`,
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Phase indicators */}
            <div className="space-y-2">
              {trainingPhases.map((phase, index) => {
                const isActive = index === currentPhase
                const isComplete = progress >= phase.max

                return (
                  <div
                    key={phase.label}
                    className={`
                      h-1 rounded-full transition-all duration-300
                      ${
                        isComplete
                          ? "bg-gradient-to-r from-green-500 to-emerald-600"
                          : isActive
                            ? "bg-gradient-to-r from-purple-600 to-pink-600"
                            : "bg-slate-800"
                      }
                    `}
                  ></div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
