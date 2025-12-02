"use client"

import { ArrowLeft, Download, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ModelDetailHeaderProps {
  name: string
  type: string
  status: "active" | "pending" | "error"
  onBack: () => void
}

const statusConfig = {
  active: { label: "Active", color: "bg-green-500", pulse: "animate-pulse" },
  pending: { label: "Training", color: "bg-amber-500", pulse: "animate-pulse" },
  error: { label: "Error", color: "bg-red-500", pulse: "" },
}

export function ModelDetailHeader({ name, type, status, onBack }: ModelDetailHeaderProps) {
  const config = statusConfig[status]

  return (
    <div className="sticky top-0 z-40 border-b border-slate-700/50 backdrop-blur-md bg-slate-950/80">
      <div className="px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{name}</h1>
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                  status === "active"
                    ? "bg-green-500/20 text-green-300"
                    : status === "pending"
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-red-500/20 text-red-300"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${config.color} ${config.pulse}`}></div>
                {config.label}
              </div>
            </div>
            <p className="text-sm text-slate-400">Type: {type}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-800/50 bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-800/50 bg-transparent">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
