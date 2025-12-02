"use client"

import { useEffect, useMemo, useState } from "react"
import { dashboardAPI } from "@/src/services/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, BarChart3, Clock3, Copy, Cpu, History, MemoryStick, Sparkles } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { toast } from "@/components/ui/use-toast"

interface ApiEvent {
  id?: number
  type?: string
  success?: boolean
  latency_ms?: number | null
  cpu_percent?: number | null
  ram_mb?: number | null
  created_at?: string | null
}

interface ApiStats {
  total_copies: number
  total_predictions: number
  success_rate: number | null
  avg_latency_ms: number | null
  avg_cpu_percent: number | null
  avg_ram_mb: number | null
  last_used_at: string | null
  recent_events: ApiEvent[]
  daily_counts?: { day: string; total: number }[]
}

interface ApiTabProps {
  modelId?: number | string
  modelFile?: string | null
  features?: string[]
  modelName?: string
}

export function ApiTab({ modelId, modelFile, features, modelName }: ApiTabProps) {
  const [stats, setStats] = useState<ApiStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      if (!modelId) return
      try {
        setLoading(true)
        const data = await dashboardAPI.getModelApiStats(modelId)
        if (data?.success === false || !data?.stats) {
          setError("Impossible de charger les statistiques API")
          setStats(null)
        } else {
          setStats(data.stats as ApiStats)
          setError(null)
        }
      } catch (e) {
        console.error(e)
        setError("Impossible de charger les statistiques API")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [modelId])

  const chartData = useMemo(() => {
    if (!stats?.daily_counts || !stats.daily_counts.length) return []
    return stats.daily_counts.map((d) => ({
      day: new Date(d.day).toLocaleDateString("fr-FR", { month: "short", day: "numeric" }),
      total: d.total,
    }))
  }, [stats?.daily_counts])

  const sampleFeatures = useMemo(() => {
    if (features && features.length) {
      return features.reduce<Record<string, string | number>>((acc, feat) => {
        acc[feat] = `exemple_${feat}`
        return acc
      }, {})
    }
    return { feature1: "exemple_valeur" }
  }, [features])

  const requestSnippet = useMemo(() => {
    const body = JSON.stringify(
      {
        model_id: modelId,
        model_file: modelFile || "<model_file>.pkl",
        features: sampleFeatures,
      },
    )
    return `curl -X POST http://localhost:5000/api/predict \\
  -H "Content-Type: application/json" \\
  -d '${body.replace(/'/g, "\\'")}'`
  }, [modelFile, modelId, sampleFeatures])

  const handleCopy = async () => {
    if (!modelId) return
    try {
      await dashboardAPI.logApiCopy(modelId)
    } catch (e) {
      console.error("copy log failed", e)
    }
    try {
      await navigator.clipboard?.writeText(requestSnippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
      toast({ title: "Copie reussie", description: "Snippet curl copie dans le presse-papiers." })
    } catch (e) {
      console.error("clipboard copy failed", e)
      toast({
        title: "Copie echouee",
        description: "Impossible de copier le snippet. Essayez manuellement.",
        variant: "destructive",
      })
    }
  }

  if (!modelId) {
    return <p className="text-slate-400">Selectionnez un modele pour voir l&apos;API.</p>
  }

  const cards = [
    {
      label: "Predictions",
      value: stats?.total_predictions ?? 0,
      icon: Activity,
      accent: "from-cyan-500/30 via-blue-500/20 to-slate-900/60",
      description: "Nombre total d appels /api/predict enregistre pour ce modele",
    },
    {
      label: "Copies",
      value: stats?.total_copies ?? 0,
      icon: Copy,
      accent: "from-emerald-500/30 via-teal-500/20 to-slate-900/60",
      description: "Combien de fois le payload API a ete copie",
    },
    {
      label: "Succes",
      value:
        stats?.success_rate !== null && stats?.success_rate !== undefined
          ? `${Math.round((stats.success_rate || 0) * 100)}%`
          : "-",
      icon: Sparkles,
      accent: "from-amber-500/30 via-orange-500/20 to-slate-900/60",
      description: "Taux de reponse /api/predict reussies",
    },
    {
      label: "Latence moyenne",
      value: stats?.avg_latency_ms ? `${stats.avg_latency_ms.toFixed(1)} ms` : "-",
      icon: Clock3,
      accent: "from-purple-500/30 via-pink-500/20 to-slate-900/60",
      description: "Temps moyen de reponse de l inference",
    },
    {
      label: "CPU moyen",
      value: stats?.avg_cpu_percent ? `${stats.avg_cpu_percent.toFixed(1)} %` : "-",
      icon: Cpu,
      accent: "from-indigo-500/30 via-blue-500/20 to-slate-900/60",
      description: "Charge CPU du serveur pendant les appels",
    },
    {
      label: "RAM moyenne",
      value: stats?.avg_ram_mb ? `${stats.avg_ram_mb.toFixed(1)} MB` : "-",
      icon: MemoryStick,
      accent: "from-pink-500/30 via-rose-500/20 to-slate-900/60",
      description: "Memoire utilisee par le processus pendant les appels",
    },
  ]

  const recentEvents = stats?.recent_events || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">API Insights</p>
          <h3 className="text-2xl font-semibold text-white">
            {modelName || "Modele"} - API de prediction
          </h3>
          <p className="text-sm text-slate-400">
            Visibilite temps reel sur les appels a /api/predict et les copies de payload.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="border-purple-500/50 bg-purple-500/10 text-purple-100 hover:bg-purple-500/20"
        >
          <Copy className="w-4 h-4 mr-2" />
          {copied ? "Copie" : "Copier le payload"}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <Card
                key={card.label}
                className="relative overflow-hidden border-slate-700/60 bg-slate-900/50 p-4 shadow-lg"
                title={card.description}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-60 blur-2xl pointer-events-none`}
                />
                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{card.label}</p>
                    <p className="text-2xl font-semibold text-white mt-1">{card.value}</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/60 border border-slate-700/70">
                    <card.icon className="w-5 h-5 text-slate-100" />
                  </span>
                </div>
              </Card>
            ))}
          </div>

          <Card className="border-slate-700/60 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-300" />
                <p className="text-sm font-semibold text-white">Appels quotidiens</p>
              </div>
              <Badge variant="outline" className="bg-slate-800/60 border-slate-700/80 text-slate-300">
                {stats?.last_used_at ? `Dernier appel - ${new Date(stats.last_used_at).toLocaleString("fr-FR")}` : "Pas encore utilise"}
              </Badge>
            </div>
            {loading ? (
              <p className="text-slate-400 text-sm">Chargement du graphique...</p>
            ) : chartData.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="apiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis allowDecimals={false} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(148,163,184,0.3)" }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#a855f7" fillOpacity={1} fill="url(#apiGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-sm">Aucune donnee quotidienne disponible.</p>
            )}
          </Card>

          <Card className="border-slate-700/60 bg-slate-900/60 p-5">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-emerald-300" />
              <p className="text-sm font-semibold text-white">Derniers evenements</p>
            </div>
            {loading ? (
              <p className="text-slate-400 text-sm">Chargement...</p>
            ) : recentEvents.length ? (
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div
                    key={event.id ?? event.created_at}
                    className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/70 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          event.success ? "bg-emerald-400 shadow-lg shadow-emerald-500/30" : "bg-red-400"
                        }`}
                      />
                      <div>
                        <p className="text-sm text-white capitalize">{event.type}</p>
                        <p className="text-xs text-slate-400">
                          {event.created_at
                            ? new Date(event.created_at).toLocaleString("fr-FR")
                            : "Horodatage inconnu"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      {event.latency_ms !== undefined && event.latency_ms !== null && (
                        <p>{event.latency_ms.toFixed(1)} ms</p>
                      )}
                      {event.cpu_percent !== undefined && event.cpu_percent !== null && <p>{event.cpu_percent}% CPU</p>}
                      {event.ram_mb !== undefined && event.ram_mb !== null && <p>{event.ram_mb.toFixed(1)} MB</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Aucun appel enregistre pour le moment.</p>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-slate-700/60 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Payload</p>
                <p className="text-sm font-semibold text-white">POST /api/predict</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopy}
                className="bg-purple-600/80 text-white hover:bg-purple-500"
              >
                {copied ? "Copie" : "Copier"}
              </Button>
            </div>
            <pre className="mt-3 max-h-80 overflow-auto rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-200">
{requestSnippet}
            </pre>
            <p className="mt-2 text-xs text-slate-400">
              Incluez <span className="text-purple-200">model_id</span> pour des statistiques precises.
            </p>
          </Card>

          {error && !loading && (
            <Card className="border-red-500/40 bg-red-500/10 text-red-100 p-4">
              <p className="text-sm font-medium">Statistiques indisponibles</p>
              <p className="text-xs text-red-200 mt-1">{error}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
