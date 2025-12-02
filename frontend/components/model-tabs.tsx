"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MetricsTab } from "./metrics-tab"
import { FeaturesTab } from "./features-tab"
import { TrainingHistoryTab } from "./training-history-tab"
import { ApiTab } from "./api-tab"

interface ModelTabsProps {
  modelId?: number | string
  modelFile?: string | null
  features?: string[]
  modelName?: string
}

export function ModelTabs({ modelId, modelFile, features, modelName }: ModelTabsProps) {
  return (
    <Tabs defaultValue="metrics" className="w-full">
      <TabsList className="bg-slate-900/40 border border-slate-700/50 p-1 rounded-lg">
        <TabsTrigger value="metrics" className="data-[state=active]:bg-slate-800 data-[state=active]:text-purple-300">
          Metrics
        </TabsTrigger>
        <TabsTrigger value="features" className="data-[state=active]:bg-slate-800 data-[state=active]:text-purple-300">
          Features
        </TabsTrigger>
        <TabsTrigger value="history" className="data-[state=active]:bg-slate-800 data-[state=active]:text-purple-300">
          Training History
        </TabsTrigger>
        <TabsTrigger value="api" className="data-[state=active]:bg-slate-800 data-[state=active]:text-purple-300">
          API
        </TabsTrigger>
      </TabsList>

      <TabsContent value="metrics" className="space-y-4 mt-6">
        <MetricsTab />
      </TabsContent>

      <TabsContent value="features" className="space-y-4 mt-6">
        <FeaturesTab />
      </TabsContent>

      <TabsContent value="history" className="space-y-4 mt-6">
        <TrainingHistoryTab />
      </TabsContent>

      <TabsContent value="api" className="space-y-4 mt-6">
        <ApiTab modelId={modelId} modelFile={modelFile || undefined} features={features} modelName={modelName} />
      </TabsContent>
    </Tabs>
  )
}
