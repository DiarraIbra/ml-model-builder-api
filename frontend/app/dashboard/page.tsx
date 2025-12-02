"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ModelCard } from "@/components/model-card"
import { Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const MOCK_MODELS = [
  {
    id: "1",
    name: "Customer Churn Predictor",
    type: "Classification" as const,
    created: "2 days ago",
    accuracy: 94.5,
    status: "active" as const,
  },
  {
    id: "2",
    name: "House Price Estimator",
    type: "Regression" as const,
    created: "1 week ago",
    accuracy: 89.3,
    status: "active" as const,
  },
  {
    id: "3",
    name: "Fraud Detection Model",
    type: "Classification" as const,
    created: "3 days ago",
    accuracy: 97.2,
    status: "active" as const,
  },
  {
    id: "4",
    name: "Sales Forecast",
    type: "Regression" as const,
    created: "5 hours ago",
    accuracy: 0,
    status: "pending" as const,
  },
  {
    id: "5",
    name: "Image Classifier v2",
    type: "Classification" as const,
    created: "1 month ago",
    accuracy: 0,
    status: "error" as const,
  },
  {
    id: "6",
    name: "Customer Segmentation",
    type: "Classification" as const,
    created: "2 weeks ago",
    accuracy: 92.1,
    status: "active" as const,
  },
]

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredModels = MOCK_MODELS.filter(
    (model) =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateClick = () => {
    console.log("Create new model")
  }

  const handleViewModel = (id: string) => {
    console.log("View model:", id)
  }

  const handleManageModel = (id: string) => {
    console.log("Manage model:", id)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onCreateClick={handleCreateClick} />

      {/* Main content */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 animate-slide-up">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border/50 focus:border-primary/50"
            />
          </div>
          <Button
            variant="outline"
            className="border-border/50 hover:bg-accent/50 text-foreground gap-2 transition-all bg-transparent"
          >
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Models grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredModels.map((model) => (
            <div key={model.id} className="animate-slide-up" style={{ animationDelay: `${model.id}00ms` }}>
              <ModelCard {...model} onView={handleViewModel} onSettings={handleManageModel} />
            </div>
          ))}
        </div>

        {filteredModels.length === 0 && (
          <div className="text-center py-12 animate-slide-up">
            <p className="text-muted-foreground text-lg mb-4">No models found</p>
            <Button
              onClick={handleCreateClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
            >
              Create your first model
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
