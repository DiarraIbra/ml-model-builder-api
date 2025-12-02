"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle, AlertCircle } from "lucide-react"

const trainingHistory = [
  {
    id: "1",
    version: "v1.0",
    date: "2024-11-20",
    duration: "12m 34s",
    accuracy: 94.2,
    status: "success",
    parameters: { epochs: 100, batchSize: 32, learningRate: 0.001 },
  },
  {
    id: "2",
    version: "v0.9",
    date: "2024-11-18",
    duration: "15m 22s",
    accuracy: 92.8,
    status: "success",
    parameters: { epochs: 80, batchSize: 32, learningRate: 0.0005 },
  },
  {
    id: "3",
    version: "v0.8",
    date: "2024-11-15",
    duration: "18m 45s",
    accuracy: 91.5,
    status: "success",
    parameters: { epochs: 100, batchSize: 64, learningRate: 0.001 },
  },
]

export function TrainingHistoryTab() {
  return (
    <div className="space-y-4 pb-8">
      {trainingHistory.map((record) => (
        <Card
          key={record.id}
          className="bg-slate-900/40 border-slate-700/50 p-6 hover:border-purple-500/50 transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-white">{record.version}</h3>
                {record.status === "success" && (
                  <div className="flex items-center gap-1 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </div>
                )}
                {record.status === "failed" && (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Failed
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-400">{record.date}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400 mb-1">{record.accuracy.toFixed(1)}%</p>
              <p className="text-sm text-slate-400">Duration: {record.duration}</p>
            </div>
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
            {Object.entries(record.parameters).map(([key, value]) => (
              <div key={key}>
                <p className="text-xs text-slate-500 uppercase mb-1">{key}</p>
                <p className="text-sm font-semibold text-slate-200">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
