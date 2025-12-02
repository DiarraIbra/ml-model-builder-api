"use client"

import { useEffect, useMemo, useState } from "react"
import { ModelDetailHeader } from "@/components/model-detail-header"
import { ModelTabs } from "@/components/model-tabs"
import { useParams, useRouter } from "next/navigation"
import { dashboardAPI } from "@/src/services/api"

export default function ModelDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [model, setModel] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadModel = async () => {
      if (!params?.id) return
      try {
        const data = await dashboardAPI.getModelDetails(params.id)
        if (data?.success === false) {
          setError("Impossible de charger le modele")
        } else {
          setModel(data)
        }
      } catch (e) {
        console.error(e)
        setError("Impossible de charger le modele")
      }
    }
    loadModel()
  }, [params?.id])

  const headerName = model?.name || "Customer Churn Predictor"
  const headerType = model?.type || "Classification"
  const headerStatus = (model?.status as "active" | "pending" | "error") || "active"
  const features = useMemo(() => {
    if (Array.isArray(model?.features)) return model.features
    if (typeof model?.features === "string") return model.features.split(",")
    return []
  }, [model?.features])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950">
      <ModelDetailHeader
        name={headerName}
        type={headerType}
        status={headerStatus}
        onBack={() => router.back()}
      />

      <div className="px-6 py-8 max-w-7xl mx-auto">
        {error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <ModelTabs
            modelId={model?.id ?? params?.id}
            modelFile={model?.model_file}
            modelName={headerName}
            features={features}
          />
        )}
      </div>
    </div>
  )
}
