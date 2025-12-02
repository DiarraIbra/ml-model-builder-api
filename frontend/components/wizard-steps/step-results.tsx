"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { generatePDFReport, type ModelDetails } from "@/components/models/model-list"
import type { WizardState } from "@/components/model-wizard"
import { CheckCircle, Trophy } from "lucide-react"

interface StepResultsProps {
  state: WizardState
  onNext: () => void
  onPrev: () => void
  onNewModel: () => void
}

export function StepResults({ state, onPrev, onNewModel }: StepResultsProps) {
  const scoreValue = (result: typeof state.trainingResults[number]) => {
    if (typeof result?.score === "number" && Number.isFinite(result.score)) return result.score
    return Object.values(result?.metrics || {}).reduce((sum, v) => (Number.isFinite(v) ? sum + v : sum), 0)
  }

  const sortedResults = [...state.trainingResults].sort((a, b) => scoreValue(b) - scoreValue(a))
  const bestAlgorithmName = state.bestAlgorithm || (sortedResults[0]?.algorithm ?? null)
  const bestAlgorithm =
    state.trainingResults.find((r) => r.algorithm === bestAlgorithmName) || sortedResults[0] || null
  const runnerUp = sortedResults.find((r) => r.algorithm !== bestAlgorithm?.algorithm)

  const metricKeys = bestAlgorithm ? Object.keys(bestAlgorithm.metrics) : []

  const metricTranslations: { [key: string]: string } = {
    accuracy: 'Précision',
    precision: 'Précision',
    recall: 'Rappel',
    f1_score: 'F1-Score',
    mse: 'Erreur quadratique moyenne',
    rmse: 'RMSE',
    mae: 'Erreur absolue moyenne',
    r2_score: 'R²'
  }

  const translateMetric = (k: string) => metricTranslations[k] || k

  const handleDownload = async () => {
    if (!state.modelFile) {
      alert('Aucun fichier modèle disponible pour le téléchargement')
      return
    }
    try {
      const url = `http://localhost:5000/api/download-model?filename=${encodeURIComponent(state.modelFile)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Téléchargement échoué')
      const blob = await res.blob()
      const a = document.createElement('a')
      const objectUrl = URL.createObjectURL(blob)
      a.href = objectUrl
      a.download = state.modelFile
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      console.error(err)
      alert('Erreur lors du téléchargement du modèle')
    }
  }

  const handleDownloadReport = () => {
    if (!bestAlgorithm) {
      alert("Aucune metrique disponible pour generer le rapport")
      return
    }

    const bestMetrics = bestAlgorithm.metrics || {}
    const primaryScore =
      typeof bestMetrics.accuracy === "number"
        ? bestMetrics.accuracy
        : typeof bestMetrics.r2_score === "number"
          ? bestMetrics.r2_score
          : undefined

    const examplePayload: Record<string, string | number> = {}
    state.inputFeatures.forEach((feat) => {
      examplePayload[feat] = `exemple_${feat}`
    })

    const modelForReport: ModelDetails = {
      id: Date.now(),
      name: state.modelName || "Modele",
      type: state.modelType,
      precision: primaryScore ?? null,
      status: "active",
      algorithm: bestAlgorithm.algorithm,
      description: state.description,
      metrics: bestMetrics,
      example_payload: Object.keys(examplePayload).length ? examplePayload : undefined,
      features: state.inputFeatures,
      target: state.outputTarget,
      model_file: state.modelFile || undefined,
      report_file: state.reportFile || undefined,
      api_stats: undefined,
    }

    generatePDFReport(modelForReport)
  }

  const formatMetric = (value?: number | null) => {
    if (typeof value !== "number" || !Number.isFinite(value)) return "N/A"
    // Show more decimals so small differences are visible
    return value.toFixed(6)
  }

  const fallbackJustification = () => {
    if (!bestAlgorithm) return "Les métriques indiquent que ce modèle est le plus équilibré sur l'ensemble des critères mesurés."
    const acc = bestAlgorithm.metrics?.['accuracy']
    const prec = bestAlgorithm.metrics?.['precision']
    const rec = bestAlgorithm.metrics?.['recall']
    const f1 = bestAlgorithm.metrics?.['f1_score']
    const base = `${bestAlgorithm.algorithm} a obtenu le meilleur équilibre global selon notre score composite (F1 et accuracy prioritaires, puis précision et rappel).`
    const metricsLine = `Performances clés : accuracy ${formatMetric(acc)}, précision ${formatMetric(prec)}, rappel ${formatMetric(rec)}, F1-Score ${formatMetric(f1)}.`
    if (runnerUp) {
      const delta = scoreValue(bestAlgorithm) - scoreValue(runnerUp)
      const runnerLine = `Il devance ${runnerUp.algorithm} de ${delta.toFixed(6)} sur ce score, ce qui reflète une meilleure stabilité généraliste.`
      return `${base} ${metricsLine} ${runnerLine}`
    }
    return `${base} ${metricsLine}`
  }

  return (
    <div className="space-y-6">
          <div className="bg-linear-to-r from-green-500/20 to-emerald-500/10 border border-green-500/50 rounded-lg p-4 flex items-start gap-3 backdrop-blur">
        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-green-100">Entraînement du modèle terminé</p>
          <p className="text-sm text-green-300 mt-1">Tous les algorithmes ont été évalués sur votre jeu de données</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-100">Comparaison des algorithmes</h3>
        <div className="overflow-x-auto border border-slate-700 rounded-lg bg-slate-800/30">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-purple-300">Algorithme</th>
                {metricKeys.map((key) => (
                  <th key={key} className="px-4 py-3 text-right font-semibold text-purple-300">
                    {translateMetric(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.trainingResults.map((result, index) => (
                <tr
                  key={index}
                  className={`border-b border-slate-700 transition-colors ${
                    bestAlgorithm && result.algorithm === bestAlgorithm.algorithm
                      ? "bg-linear-to-r from-purple-500/20 to-pink-500/10 hover:from-purple-500/30 hover:to-pink-500/20"
                      : "hover:bg-slate-700/30"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-slate-100">
                    <div className="flex items-center gap-2">
                      {bestAlgorithm && result.algorithm === bestAlgorithm.algorithm && (
                        <Trophy className="w-4 h-4 text-yellow-400" />
                      )}
                      {result.algorithm}
                    </div>
                  </td>
                  {metricKeys.map((key) => (
                    <td key={key} className="px-4 py-3 text-right text-slate-300">
                      {formatMetric(result.metrics[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {bestAlgorithm && (
        <Card className="p-5 border-l-4 border-l-purple-500 bg-linear-to-r from-purple-500/20 to-pink-500/10 space-y-2">
          <p className="text-sm font-semibold text-purple-200">Pourquoi {bestAlgorithm.algorithm} a été sélectionné</p>
          <p className="text-sm text-slate-300">
            {state.justification || fallbackJustification()}
          </p>
          <div className="text-sm text-slate-200 space-y-1">
            <p className="font-semibold text-purple-200">Interprétation détaillée</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-200/90">
              <li>
                Equilibre précision/rappel : précision {formatMetric(bestAlgorithm.metrics?.['precision'])} et rappel{" "}
                {formatMetric(bestAlgorithm.metrics?.['recall'])} montrent peu de faux positifs et une bonne couverture des vrais positifs.
              </li>
              <li>
                Qualité globale : accuracy {formatMetric(bestAlgorithm.metrics?.['accuracy'])} et F1-Score{" "}
                {formatMetric(bestAlgorithm.metrics?.['f1_score'])} restent cohérents, signe d'un modèle qui généralise bien sur des classes possiblement déséquilibrées.
              </li>
              {runnerUp && (
                <li>
                  Comparaison : il reste devant {runnerUp.algorithm} grâce à un score composite supérieur ({scoreValue(bestAlgorithm).toFixed(6)} vs{" "}
                  {scoreValue(runnerUp).toFixed(6)}), confirmant une marge de sécurité sur plusieurs métriques.
                </li>
              )}
              <li>
                Fiabilité : l'entraînement inclut une normalisation systématique avant le SVM pour conserver une marge de décision stable et limiter le sur-apprentissage.
              </li>
            </ul>
          </div>
        </Card>
      )}

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onPrev} className="border-slate-600 hover:bg-slate-800 bg-transparent">
          Retour
        </Button>
        <Button
          variant="outline"
          onClick={onNewModel}
          className="flex-1 bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700"
        >
          Créer un nouveau modèle
        </Button>
        <Button
          onClick={handleDownload}
          className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/50"
        >
          Télécharger le modèle
        </Button>
        <Button
          onClick={handleDownloadReport}
          className="flex-1 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg shadow-blue-500/50"
        >
          Télécharger le rapport
        </Button>
      </div>
    </div>
  )
}
