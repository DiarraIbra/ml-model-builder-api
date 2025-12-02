"use client"

import { Eye, Settings, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface ModelCardProps {
  id: string
  name: string
  type: "Classification" | "Regression"
  created: string
  accuracy: number
  status: "active" | "pending" | "error"
  onView: (id: string) => void
  onSettings: (id: string) => void
}

const statusConfig = {
  active: { label: "Active", badge: "badge-active" },
  pending: { label: "Training", badge: "badge-pending" },
  error: { label: "Error", badge: "badge-error" },
}

export function ModelCard({ id, name, type, created, accuracy, status, onView, onSettings }: ModelCardProps) {
  const config = statusConfig[status]

  const accuracyColor = accuracy >= 90 ? "text-success" : accuracy >= 70 ? "text-warning" : "text-destructive"

  const accentBarColor =
    status === "active"
      ? "from-success to-emerald-600"
      : status === "pending"
        ? "from-warning to-orange-600"
        : "from-destructive to-red-600"

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

      <div className="relative bg-card backdrop-blur border border-border/50 rounded-lg p-6 hover:border-primary/50 transition-all duration-300 overflow-hidden">
        {/* Left accent bar - colored by status */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${accentBarColor}`}></div>

        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between pl-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">{name}</h3>
              <p className="text-xs text-muted-foreground mt-1">Created {created}</p>
            </div>
            <span className={config.badge}>{config.label}</span>
          </div>

          {/* Type badge */}
          <div className="pl-4 flex items-center gap-2">
            <span className="inline-block px-3 py-1 bg-primary/15 border border-primary/30 rounded-full text-xs font-medium text-primary">
              {type}
            </span>
          </div>

          {/* Accuracy section */}
          <div className="pl-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Accuracy
              </span>
              <span className={`text-sm font-semibold ${accuracyColor}`}>{accuracy.toFixed(1)}%</span>
            </div>
            <Progress value={accuracy} className="h-2" />
          </div>

          {/* Actions */}
          <div className="pl-4 flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(id)}
              className="hover:bg-primary/10 hover:border-primary/50 flex-1 transition-all"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSettings(id)}
              className="hover:bg-primary/10 hover:border-primary/50 flex-1 transition-all"
            >
              <Settings className="w-4 h-4 mr-1" />
              Manage
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
