"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

interface DashboardHeaderProps {
  onCreateClick: () => void
}

export function DashboardHeader({ onCreateClick }: DashboardHeaderProps) {
  return (
    <div className="sticky top-0 z-40 border-b border-border/40 backdrop-blur-md bg-background/80">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Models</h1>
          <p className="text-sm text-muted-foreground">Manage your trained ML models</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            onClick={onCreateClick}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Model
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-border/30 bg-card/40">
        <MetricItem label="Total Models" value="24" />
        <MetricItem label="Classification" value="16" />
        <MetricItem label="Regression" value="8" />
        <MetricItem label="Avg Accuracy" value="94.2%" />
      </div>
    </div>
  )
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{label}</span>
      <span className="text-lg font-semibold text-foreground">{value}</span>
    </div>
  )
}
