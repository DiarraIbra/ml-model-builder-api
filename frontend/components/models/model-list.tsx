"use client"

import { useEffect, useMemo, useState } from "react"
import { dashboardAPI } from "@/src/services/api"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, BarChart3, Zap, FileDown } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from "recharts"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { toast } from "@/components/ui/use-toast"

export interface ModelInfo {
  id: number | string
  name: string
  type: string
  precision: number | null
  created_at?: string
  status?: string
  algorithm?: string
  description?: string
}

export interface ModelDetails extends ModelInfo {
  metrics?: Record<string, any>
  example_payload?: Record<string, any>
  features?: string[]
  target?: string
  model_file?: string
  report_file?: string
  api_stats?: {
    total_copies: number
    total_predictions: number
    success_predictions: number
    failed_predictions: number
    success_rate: number | null
    avg_latency_ms: number | null
    avg_cpu_percent: number | null
    avg_ram_mb: number | null
    last_used_at: string | null
  }
}

  export const generatePDFReport = (model: ModelDetails) => {
  const doc: any = new jsPDF()
  const setOpacity = (opacity: number) => {
    const GState: any = doc?.GState
    if (GState && doc?.setGState) {
      doc.setGState(new GState({ opacity }))
    } else if (doc?.setFillOpacity) {
      doc.setFillOpacity(opacity)
    }
  }

  const cleanText = (input: any): any => {
    if (Array.isArray(input)) return input.map((v) => cleanText(v))
    if (typeof input === "string") {
      return input.normalize("NFKD").replace(/[^\x00-\x7F]/g, "")
    }
    return input
  }

  const sanitizeTable = (rows: any[][]) => rows.map((row) => row.map((cell) => cleanText(cell)))

  const originalText = doc.text.bind(doc)
  doc.text = (content: any, x: any, y: any, options?: any) => originalText(cleanText(content), x, y, options)
  
  // ═══════════════════════════════════════════════════════════
  // CONFIGURATION DES COULEURS - Palette moderne pour l'IA
  // ═══════════════════════════════════════════════════════════
  const colors = {
    primary: [99, 102, 241] as [number, number, number],      // Indigo - Couleur principale
    secondary: [59, 130, 246] as [number, number, number],    // Blue - Accent
    accent: [6, 182, 212] as [number, number, number],        // Cyan - Highlights
    success: [16, 185, 129] as [number, number, number],      // Emerald - Succès
    warning: [245, 158, 11] as [number, number, number],      // Amber - Attention
    danger: [239, 68, 68] as [number, number, number],        // Red - Danger
    neutral: [148, 163, 184] as [number, number, number],     // Slate - Texte secondaire
    dark: [30, 41, 59] as [number, number, number],           // Slate-800 - Fond sombre
    light: [248, 250, 252] as [number, number, number]        // Slate-50 - Fond clair
  }
  
  let yPos = 0
  
  // ═══════════════════════════════════════════════════════════
  // PAGE 1: COUVERTURE ÉLÉGANTE
  // ═══════════════════════════════════════════════════════════
  
  // Fond dégradé (simulé avec rectangles)
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2])
  doc.rect(0, 0, 210, 297, 'F')
  
  // Overlay semi-transparent
  doc.setFillColor(0, 0, 0)
  setOpacity(0.3)
  doc.rect(0, 0, 210, 297, 'F')
  setOpacity(1)
  
  // Motif décoratif (cercles)
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(0.5)
  setOpacity(0.1)
  doc.circle(180, 40, 30, 'S')
  doc.circle(30, 250, 40, 'S')
  doc.circle(190, 280, 25, 'S')
  setOpacity(1)
  
  // Badge "AI MODEL REPORT"
  doc.setFillColor(255, 255, 255)
  setOpacity(0.15)
  doc.roundedRect(60, 80, 90, 12, 6, 6, 'F')
  setOpacity(1)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont("helvetica", 'bold')
  doc.text('AI MODEL REPORT', 105, 87, { align: 'center' })
  
  // Titre principal
  doc.setFontSize(36)
  doc.setFont("helvetica", 'bold')
  doc.text(model.name, 105, 120, { align: 'center', maxWidth: 180 })
  
  // Type et algorithme
  doc.setFontSize(16)
  doc.setFont("helvetica", 'normal')
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2])
  const subtitle = `${model.type.toUpperCase()}${model.algorithm ? ` - ${model.algorithm}` : ''}`
  doc.text(subtitle, 105, 135, { align: 'center' })
  
  // Ligne décorative
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(0.5)
  doc.line(55, 145, 155, 145)
  
  // Description si disponible
  if (model.description) {
    doc.setFontSize(11)
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", 'normal')
    const splitDesc = doc.splitTextToSize(model.description, 140)
    doc.text(splitDesc, 105, 160, { align: 'center', maxWidth: 140 })
  }
  
  // Score principal en grand (si disponible)
  const mainScore = model.precision ?? model.metrics?.accuracy ?? model.metrics?.r2_score
  if (mainScore !== null && mainScore !== undefined) {
    yPos = model.description ? 190 : 170
    
    // Cercle de fond
    doc.setFillColor(255, 255, 255)
    setOpacity(0.1)
    doc.circle(105, yPos, 25, 'F')
    setOpacity(1)
    
    // Score
    doc.setFontSize(42)
    doc.setFont("helvetica", 'bold')
    doc.setTextColor(255, 255, 255)
    const scoreText = `${(mainScore * 100).toFixed(1)}%`
    doc.text(scoreText, 105, yPos + 5, { align: 'center' })
    
    // Label
    doc.setFontSize(10)
    doc.setFont("helvetica", 'normal')
    doc.text('SCORE PRINCIPAL', 105, yPos + 15, { align: 'center' })
  }
  
  // Informations de génération en bas
  doc.setFontSize(9)
  doc.setTextColor(200, 200, 200)
  doc.setFont("helvetica", 'normal')
  const genDate = new Date()
  doc.text(`Rapport genere le ${genDate.toLocaleDateString('fr-FR')} a ${genDate.toLocaleTimeString('fr-FR')}`, 105, 270, { align: 'center' })
  doc.text(`ID du modele: ${model.id}`, 105, 277, { align: 'center' })
  
  // ═══════════════════════════════════════════════════════════
  // PAGE 2: RÉSUMÉ EXÉCUTIF
  // ═══════════════════════════════════════════════════════════
  doc.addPage()
  yPos = 20
  
  // En-tête de page
  addPageHeader(doc, colors, 'Resume Executif')
  yPos = 40
  
  // Section: Vue d'ensemble
  addSectionTitle(doc, colors, 'Vue d ensemble du modele', yPos)
  yPos += 15
  
  // Tableau des informations principales
  const overviewData = sanitizeTable([
    ['Nom du modele', model.name],
    ['Type de modele', model.type || '-'],
    ['Algorithme utilise', model.algorithm || '-'],
    ['Variable cible', model.target || '-'],
    ['Date de creation', model.created_at ? new Date(model.created_at).toLocaleDateString('fr-FR') : '-'],
    ['Statut actuel', (model.status || 'active').toUpperCase()],
    ['Fichier du modele', model.model_file || '-']
  ])
  
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: overviewData,
    theme: 'plain',
    styles: { 
      fontSize: 9, 
      cellPadding: 4,
      lineWidth: 0.1,
      lineColor: colors.neutral
    },
    columnStyles: {
      0: { 
        fontStyle: 'bold', 
        cellWidth: 60,
        textColor: colors.dark,
        fillColor: colors.light
      },
      1: { 
        cellWidth: 120,
        textColor: [50, 50, 50]
      }
    },
    margin: { left: 20, right: 20 }
  })
  
  yPos = (doc as any).lastAutoTable.finalY + 15
  
  // Section: Interprétation du type de modèle
  addInfoBox(doc, colors, yPos, 
    'Info sur ce type de modele',
    model.type.toLowerCase().includes('reg') 
      ? 'Modele de REGRESSION: predit des valeurs numeriques continues (ex: prix, temperature, revenus). Les metriques cles incluent R2, RMSE et MAE.'
      : 'Modele de CLASSIFICATION: predit des categories/classes (ex: spam/non-spam, chien/chat). Les metriques cles incluent accuracy, precision et recall.'
  )
  yPos += 25
  
  // Statistiques d'utilisation API
  if (model.api_stats) {
    if (yPos > 240) {
      doc.addPage()
      addPageHeader(doc, colors, 'Resume Executif (suite)')
      yPos = 40
    }
    
      addSectionTitle(doc, colors, 'Statistiques d utilisation', yPos)
    yPos += 12
    
    const stats = model.api_stats
    const statsData = sanitizeTable([
      ['Predictions totales', stats.total_predictions?.toString() || '0'],
      ['Predictions reussies', stats.success_predictions?.toString() || '0'],
      ['Predictions echouees', stats.failed_predictions?.toString() || '0'],
      ['Taux de succes', stats.success_rate ? `${(stats.success_rate * 100).toFixed(1)}%` : '-'],
      ['Latence moyenne', stats.avg_latency_ms ? `${stats.avg_latency_ms.toFixed(1)} ms` : '-'],
      ['CPU moyen', stats.avg_cpu_percent ? `${stats.avg_cpu_percent.toFixed(1)}%` : '-'],
      ['RAM moyenne', stats.avg_ram_mb ? `${stats.avg_ram_mb.toFixed(1)} MB` : '-'],
      ['Copies de payload', stats.total_copies?.toString() || '0'],
      ['Derniere utilisation', stats.last_used_at ? new Date(stats.last_used_at).toLocaleString('fr-FR') : 'Jamais']
    ])
    
    autoTable(doc, {
      startY: yPos,
      head: [['Métrique', 'Valeur']],
      body: statsData,
      theme: 'striped',
      headStyles: { 
        fillColor: colors.secondary,
        fontSize: 10,
        fontStyle: 'bold',
        textColor: [255, 255, 255]
      },
      alternateRowStyles: { fillColor: colors.light },
      styles: { fontSize: 9, cellPadding: 3.5 },
      margin: { left: 20, right: 20 }
    })
    
    yPos = (doc as any).lastAutoTable.finalY + 10
  }
  
  // ═══════════════════════════════════════════════════════════
  // PAGE 3+: MÉTRIQUES DE PERFORMANCE DÉTAILLÉES
  // ═══════════════════════════════════════════════════════════
  if (model.metrics && Object.keys(model.metrics).length > 0) {
    doc.addPage()
    addPageHeader(doc, colors, 'Métriques de Performance')
    yPos = 40
    
      addSectionTitle(doc, colors, 'Analyse detaillee des performances', yPos)
    yPos += 12
    
    // Déterminer le type de modèle
    const isRegression = model.type.toLowerCase().includes('reg')
    
    // Métriques avec explications détaillées
    const metricsExplanations: Record<string, { label: string; description: string; interpretation: (val: number) => string }> = {
      // Métriques de CLASSIFICATION
      'accuracy': {
        label: 'Accuracy (Exactitude)',
        description: 'Proportion de prédictions correctes parmi toutes les prédictions. Métrique globale simple mais peut être trompeuse avec des classes déséquilibrées.',
        interpretation: (val) => {
          if (val >= 0.95) return '🟢 EXCELLENT - Le modèle est très fiable'
          if (val >= 0.85) return '🟡 BON - Performances solides'
          if (val >= 0.70) return '🟠 CORRECT - Peut nécessiter des améliorations'
          return '🔴 FAIBLE - Optimisation recommandée'
        }
      },
      'precision': {
        label: 'Precision (Précision)',
        description: 'Parmi les prédictions positives, quelle proportion est réellement correcte. Minimise les faux positifs. Important quand le coût d\'une fausse alarme est élevé.',
        interpretation: (val) => {
          if (val >= 0.90) return '🟢 EXCELLENT - Très peu de faux positifs'
          if (val >= 0.75) return '🟡 BON - Nombre raisonnable de faux positifs'
          if (val >= 0.60) return '🟠 CORRECT - Attention aux faux positifs'
          return '🔴 FAIBLE - Trop de faux positifs'
        }
      },
      'recall': {
        label: 'Recall (Rappel/Sensibilité)',
        description: 'Proportion des vrais positifs correctement identifiés. Minimise les faux négatifs. Crucial quand manquer une détection est coûteux (ex: cancer).',
        interpretation: (val) => {
          if (val >= 0.90) return '🟢 EXCELLENT - Capture presque tous les cas positifs'
          if (val >= 0.75) return '🟡 BON - Capture la plupart des cas'
          if (val >= 0.60) return '🟠 CORRECT - Certains cas manqués'
          return '🔴 FAIBLE - Trop de cas manqués'
        }
      },
      'f1_score': {
        label: 'F1-Score',
        description: 'Moyenne harmonique entre précision et recall. Équilibre entre faux positifs et faux négatifs. Idéal pour données déséquilibrées.',
        interpretation: (val) => {
          if (val >= 0.90) return '🟢 EXCELLENT - Équilibre optimal précision/recall'
          if (val >= 0.75) return '🟡 BON - Bon compromis'
          if (val >= 0.60) return '🟠 CORRECT - Déséquilibre présent'
          return '🔴 FAIBLE - Déséquilibre important'
        }
      },
      
      // Métriques de RÉGRESSION
      'r2_score': {
        label: 'R² (Coefficient de détermination)',
        description: 'Proportion de la variance expliquée par le modèle (0 à 1). R²=1 signifie ajustement parfait. R²<0 indique que le modèle est pire qu\'une simple moyenne.',
        interpretation: (val) => {
          if (val >= 0.90) return '🟢 EXCELLENT - Le modèle explique >90% de la variance'
          if (val >= 0.70) return '🟡 BON - Bonne capacité prédictive'
          if (val >= 0.50) return '🟠 CORRECT - Capacité moyenne'
          if (val >= 0) return '🔴 FAIBLE - Faible pouvoir explicatif'
          return '🔴 TRÈS FAIBLE - Pire qu\'une moyenne simple'
        }
      },
      'rmse': {
        label: 'RMSE (Root Mean Squared Error)',
        description: 'Racine de l\'erreur quadratique moyenne. Même unité que la cible. Pénalise fortement les grosses erreurs. Plus c\'est bas, mieux c\'est.',
        interpretation: (val) => {
          return `📊 Erreur typique: ${val.toFixed(2)} unités. Comparez avec l'échelle de votre variable cible pour juger.`
        }
      },
      'mae': {
        label: 'MAE (Mean Absolute Error)',
        description: 'Erreur absolue moyenne. Écart moyen entre prédictions et valeurs réelles. Plus robuste aux valeurs extrêmes que RMSE. Plus c\'est bas, mieux c\'est.',
        interpretation: (val) => {
          return `📊 Écart moyen: ${val.toFixed(2)} unités. Représente l'erreur "typique" du modèle.`
        }
      },
      'mse': {
        label: 'MSE (Mean Squared Error)',
        description: 'Erreur quadratique moyenne. Carré des écarts. Pénalise fortement les grandes erreurs. La racine carrée donne le RMSE.',
        interpretation: (val) => {
          return `📊 MSE: ${val.toFixed(2)}. RMSE équivalent: ${Math.sqrt(val).toFixed(2)}`
        }
      }
    }
    
    // Filtrer les métriques pertinentes selon le type
    const relevantMetrics = Object.entries(model.metrics).filter(([key]) => {
      if (isRegression) {
        return ['r2_score', 'rmse', 'mae', 'mse'].includes(key)
      } else {
        return ['accuracy', 'precision', 'recall', 'f1_score'].includes(key)
      }
    })
    
    // Afficher chaque métrique avec son explication
    for (const [key, value] of relevantMetrics) {
      if (yPos > 240) {
        doc.addPage()
        addPageHeader(doc, colors, 'Métriques de Performance (suite)')
        yPos = 40
      }
      
      const metricInfo = metricsExplanations[key]
      if (metricInfo && typeof value === 'number') {
        // Boîte de métrique
        doc.setFillColor(colors.light[0], colors.light[1], colors.light[2])
        doc.roundedRect(20, yPos, 170, 35, 3, 3, 'F')
        
        // Bordure colorée à gauche
        doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2])
        doc.roundedRect(20, yPos, 4, 35, 2, 2, 'F')
        
        // Nom de la métrique
        doc.setFontSize(11)
        doc.setFont("helvetica", 'bold')
        doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2])
        doc.text(metricInfo.label, 28, yPos + 6)
        
        // Valeur
        doc.setFontSize(16)
        doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
        doc.text(value.toFixed(4), 165, yPos + 6, { align: 'right' })
        
        // Description
        doc.setFontSize(8)
        doc.setFont("helvetica", 'normal')
        doc.setTextColor(80, 80, 80)
        const descLines = doc.splitTextToSize(metricInfo.description, 160)
        doc.text(descLines, 28, yPos + 13)
        
        // Interprétation
        const interpretation = metricInfo.interpretation(value)
        doc.setFontSize(8)
        doc.setFont("helvetica", 'bold')
        doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2])
        doc.text(interpretation, 28, yPos + 28)
        
        yPos += 40
      }
    }
    
    // Ajouter les autres métriques (non détaillées)
    const otherMetrics = Object.entries(model.metrics).filter(([key]) => !metricsExplanations[key])
    if (otherMetrics.length > 0) {
      if (yPos > 220) {
        doc.addPage()
        addPageHeader(doc, colors, 'Métriques de Performance (suite)')
        yPos = 40
      }
      
      addSectionTitle(doc, colors, 'Autres métriques enregistrées', yPos)
      yPos += 12
      
      const otherData = sanitizeTable(
        otherMetrics.map(([key, value]) => [
          key.toUpperCase().replace(/_/g, ' '),
          typeof value === 'number' ? value.toFixed(4) : value
        ])
      )
      
      autoTable(doc, {
        startY: yPos,
        head: [['Métrique', 'Valeur']],
        body: otherData,
        theme: 'striped',
        headStyles: { 
          fillColor: colors.primary,
          fontSize: 10,
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: colors.light },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: 20, right: 20 }
      })
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // PAGE: FEATURES UTILISÉES
  // ═══════════════════════════════════════════════════════════
  if (model.features && model.features.length > 0) {
    doc.addPage()
    addPageHeader(doc, colors, 'Features du Modèle')
    yPos = 40
    
    addSectionTitle(doc, colors, `Variables d'entrée (${model.features.length} features)`, yPos)
    yPos += 12
    
    addInfoBox(doc, colors, yPos,
      '📊 Importance des features',
      'Les features (variables d\'entrée) sont les données que le modèle utilise pour faire ses prédictions. La qualité et la pertinence de ces features impactent directement les performances du modèle.'
    )
    yPos += 25
    
    const featuresData = sanitizeTable(model.features.map((feature, idx) => [
      (idx + 1).toString(),
      feature
    ]))
    
    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Nom de la feature']],
      body: featuresData,
      theme: 'striped',
      headStyles: { 
        fillColor: colors.primary,
        fontSize: 10,
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: colors.light },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 160 }
      },
      margin: { left: 20, right: 20 }
    })
  }
  
  // ═══════════════════════════════════════════════════════════
  // PAGE FINALE: RECOMMANDATIONS
  // ═══════════════════════════════════════════════════════════
  doc.addPage()
  addPageHeader(doc, colors, 'Recommandations & Prochaines Étapes')
  yPos = 40
  
  addSectionTitle(doc, colors, 'Comment améliorer ce modèle ?', yPos)
  yPos += 15
  
  // Recommandations basées sur le type
  const recommendations = model.type.toLowerCase().includes('reg') ? [
    {
      icon: '🎯',
      title: 'Optimiser les features',
      desc: 'Analysez les corrélations, supprimez les features redondantes, créez de nouvelles features par ingénierie (feature engineering).'
    },
    {
      icon: '⚙️',
      title: 'Tuning des hyperparamètres',
      desc: 'Utilisez GridSearchCV ou RandomSearchCV pour trouver les meilleurs hyperparamètres de votre algorithme.'
    },
    {
      icon: '📊',
      title: 'Valider la généralisation',
      desc: 'Utilisez la validation croisée (k-fold) pour vous assurer que le modèle performe bien sur des données non vues.'
    },
    {
      icon: '🔍',
      title: 'Analyser les résidus',
      desc: 'Tracez les résidus (erreurs) pour détecter des patterns. Des résidus aléatoires indiquent un bon modèle.'
    }
  ] : [
    {
      icon: '⚖️',
      title: 'Équilibrer les classes',
      desc: 'Si les classes sont déséquilibrées, utilisez SMOTE, sous-échantillonnage, ou ajustez les poids de classe.'
    },
    {
      icon: '📈',
      title: 'Optimiser le seuil',
      desc: 'Ajustez le seuil de classification selon que vous privilégiez la précision ou le recall (courbe ROC).'
    },
    {
      icon: '🎲',
      title: 'Validation croisée stratifiée',
      desc: 'Utilisez StratifiedKFold pour maintenir la proportion des classes dans chaque fold de validation.'
    },
    {
      icon: '🔬',
      title: 'Analyser la matrice de confusion',
      desc: 'Identifiez quelles classes sont confondues et ajustez vos features ou votre algorithme en conséquence.'
    }
  ]
  
  recommendations.forEach(rec => {
    if (yPos > 250) {
      doc.addPage()
      addPageHeader(doc, colors, 'Recommandations (suite)')
      yPos = 40
    }
    
    // Boîte de recommandation
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2])
    doc.roundedRect(20, yPos, 170, 22, 3, 3, 'F')
    
    // Icône et titre
    doc.setFontSize(11)
    doc.setFont("helvetica", 'bold')
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2])
    doc.text(`${rec.icon} ${rec.title}`, 25, yPos + 7)
    
    // Description
    doc.setFontSize(9)
    doc.setFont("helvetica", 'normal')
    doc.setTextColor(80, 80, 80)
    const descLines = doc.splitTextToSize(rec.desc, 165)
    doc.text(descLines, 25, yPos + 14)
    
    yPos += 27
  })
  
  // Section ressources
  if (yPos > 220) {
    doc.addPage()
    addPageHeader(doc, colors, 'Recommandations (suite)')
    yPos = 40
  }
  
  yPos += 10
  addSectionTitle(doc, colors, '📚 Ressources utiles', yPos)
  yPos += 12
  
  doc.setFontSize(9)
  doc.setFont("helvetica", 'normal')
  doc.setTextColor(80, 80, 80)
  const resources = [
    '• Documentation Scikit-learn: https://scikit-learn.org/stable',
    '• Comprendre les métriques ML: https://machinelearningmastery.com',
    '• Feature Engineering: https://featuretools.com',
    '• Validation croisée: https://scikit-learn.org/stable/modules/cross_validation.html',
  ]
  resources.forEach((res, idx) => {
    doc.text(res, 25, yPos + (idx * 6))
  })
  
  // ═══════════════════════════════════════════════════════════
  // PIED DE PAGE SUR TOUTES LES PAGES
  // ═══════════════════════════════════════════════════════════
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    // Ligne de séparation
    doc.setDrawColor(colors.neutral[0], colors.neutral[1], colors.neutral[2])
    doc.setLineWidth(0.5)
    doc.line(20, 285, 190, 285)
    
    // Numéro de page
    doc.setFontSize(8)
    doc.setTextColor(colors.neutral[0], colors.neutral[1], colors.neutral[2])
    doc.setFont("helvetica", 'normal')
    doc.text(`Page ${i} sur ${pageCount}`, 105, 290, { align: 'center' })
    
    // Signature
    doc.setFontSize(7)
    doc.text('Généré automatiquement par votre plateforme ML', 105, 294, { align: 'center' })
  }
  
  // Télécharger le PDF
  const fileName = `rapport_detaille_${model.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

// ═══════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════

function addPageHeader(doc: jsPDF, colors: any, title: string) {
  // Barre supérieure
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2])
  doc.rect(0, 0, 210, 25, 'F')
  
  // Titre
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont("helvetica", 'bold')
  doc.text(title, 20, 15)
  
  // Icône IA
  doc.setFontSize(10)
  doc.text('🤖 AI Report', 170, 15)
}

function addSectionTitle(doc: jsPDF, colors: any, title: string, yPos: number) {
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2])
  doc.roundedRect(20, yPos, 4, 8, 2, 2, 'F')
  
  doc.setFontSize(12)
  doc.setFont("helvetica", 'bold')
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2])
  doc.text(title, 28, yPos + 6)
}

function addInfoBox(doc: jsPDF, colors: any, yPos: number, title: string, content: string) {
  // Fond de la boîte
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2])
  const anyDoc: any = doc as any
  const GState = anyDoc?.GState
  if (GState && anyDoc?.setGState) {
    const OpacityState: any = GState
    anyDoc.setGState(new OpacityState({ opacity: 0.1 }))
  } else if (anyDoc?.setFillOpacity) {
    anyDoc.setFillOpacity(0.1)
  }
  doc.roundedRect(20, yPos, 170, 18, 3, 3, 'F')
  if (GState && anyDoc?.setGState) {
    const OpacityState: any = GState
    anyDoc.setGState(new OpacityState({ opacity: 1 }))
  } else if (anyDoc?.setFillOpacity) {
    anyDoc.setFillOpacity(1)
  }
  
  // Bordure
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2])
  doc.setLineWidth(0.5)
  doc.roundedRect(20, yPos, 170, 18, 3, 3, 'S')
  
  // Titre
  doc.setFontSize(9)
  doc.setFont("helvetica", 'bold')
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2])
  doc.text(title, 25, yPos + 5)
  
  // Contenu
  doc.setFontSize(8)
  doc.setFont("helvetica", 'normal')
  doc.setTextColor(80, 80, 80)
  const contentLines = doc.splitTextToSize(content, 165)
  doc.text(contentLines, 25, yPos + 10)
}

export function ModelList() {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<ModelDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ModelInfo | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const buildFeaturesSample = (model: ModelDetails) => {
    if (model.example_payload && Object.keys(model.example_payload).length) {
      return model.example_payload
    }
    if (model.features && model.features.length) {
      return model.features.reduce<Record<string, string | number>>((acc, f) => {
        acc[f] = `exemple_${f}`
        return acc
      }, {})
    }
    return { feature1: "exemple_valeur" }
  }

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        return true
      }
    } catch (e) {
      // fallback below
    }
    try {
      const textarea = document.createElement("textarea")
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      return true
    } catch (e) {
      return false
    }
  }

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true)
        const data = await dashboardAPI.getAllModels()
        if (data?.success !== false && Array.isArray(data.models)) {
          setModels(data.models)
        } else {
          setError("Impossible de charger les modèles")
        }
      } catch (e) {
        console.error(e)
        setError("Impossible de charger les modèles")
      } finally {
        setLoading(false)
      }
    }
    fetchModels()
  }, [])

  const removeModelFromState = (id: number | string) => {
    setModels((prev) => prev.filter((m) => m.id !== id))
    setSelected((prev) => (prev && prev.id === id ? null : prev))
  }

  const loadDetails = async (id: number | string) => {
    try {
      setDetailsLoading(true)
      const data = await dashboardAPI.getModelDetails(id)
      if (data?.success !== false) {
        setSelected(data as ModelDetails)
      } else {
        setError("Détails indisponibles")
      }
    } catch (e) {
      console.error(e)
      setError("Détails indisponibles")
    } finally {
      setDetailsLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      setIsDeleting(true)
      const res = await dashboardAPI.deleteModel(deleteTarget.id)
      if (res?.success) {
        removeModelFromState(deleteTarget.id)
        toast({ title: "Modèle supprimé", description: `${deleteTarget.name} a été supprimé.` })
      } else {
        throw new Error(res?.error || "Suppression impossible")
      }
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "La suppression a échoué.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }



  const chartData = useMemo(() => {
    return models.map((m) => ({
      name: m.name,
      score: m.precision ?? 0,
      date: m.created_at ? new Date(m.created_at).getTime() : null,
      type: m.type,
    }))
  }, [models])

  if (loading) {
    return <p className="text-slate-300 text-center mt-8">Chargement des modèles...</p>
  }

  if (error) {
    return <p className="text-red-400 text-center mt-8">{error}</p>
  }

  if (!models.length) {
    return <p className="text-slate-300 text-center mt-8">Aucun modèle pour le moment.</p>
  }

  return (
    <div className="space-y-8 mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-900/40 border border-slate-800 backdrop-blur">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <p className="text-sm font-semibold text-slate-100">Scores par modèle</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" hide />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Bar dataKey="score" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-6 bg-slate-900/40 border border-slate-800 backdrop-blur">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-cyan-400" />
            <p className="text-sm font-semibold text-slate-100">Évolution des scores</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData.filter((d) => d.date !== null).sort((a, b) => (a.date || 0) - (b.date || 0))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis hide dataKey="date" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">Vos modèles ({models.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {models.map((m) => (
            <div key={m.id} className="group relative h-full overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-purple-600/10 to-pink-600/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              <Card className="relative h-full flex flex-col bg-slate-900/50 border border-slate-700/60 hover:border-purple-500/50 transition-all duration-300 p-5 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-purple-500 to-pink-600 rounded-full"></div>

              <div className="flex-1 flex flex-col gap-4 pl-3">
                {/* Header section */}
                <div className="flex items-start justify-between gap-2 min-h-0">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-slate-100 truncate hover:text-purple-300 transition-colors">
                        {m.name}
                      </h4>
                      {m.algorithm && <p className="text-xs text-slate-400 truncate mt-1">{m.algorithm}</p>}
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 ${
                        m.type === "classification"
                          ? "bg-purple-500/20 text-purple-200 border-purple-400/40"
                          : "bg-blue-500/20 text-blue-200 border-blue-400/40"
                      }`}
                    >
                      {m.type}
                    </Badge>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-800/50 rounded-lg p-2.5">
                      <p className="text-slate-500 font-medium">Statut</p>
                      <p className="text-slate-100 font-semibold capitalize">{m.status || "active"}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-2.5">
                      <p className="text-slate-500 font-medium">Score</p>
                      <p className="text-slate-100 font-semibold">
                        {m.precision !== null && m.precision !== undefined ? `${(m.precision * 100).toFixed(0)}%` : "-"}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-slate-500">
                    {m.created_at ? new Date(m.created_at).toLocaleDateString("fr-FR") : "N/A"}
                  </p>
                </div>

                {/* Action button */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadDetails(m.id)}
                    className="flex-1 cursor-pointer border-slate-600 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all text-slate-200 text-xs"
                  >
                    Détails
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteTarget(m)}
                    className="cursor-pointer border-red-500/60 text-red-200 hover:bg-red-600/10 hover:border-red-400/70 text-xs"
                  >
                    Supprimer
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <Card className="p-6 bg-slate-950/80 border border-slate-700 backdrop-blur space-y-6 mt-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold text-slate-100">{selected.name}</h3>
              {selected.description && <p className="text-sm text-slate-400 mt-1">{selected.description}</p>}
              <div className="flex gap-2 mt-3 flex-wrap">
                <Badge className="bg-purple-600/30 text-purple-200 border-purple-400/40">{selected.type}</Badge>
                {selected.algorithm && (
                  <Badge className="bg-blue-600/30 text-blue-200 border-blue-400/40">{selected.algorithm}</Badge>
                )}
              </div>
            </div>
            <Button variant="ghost" onClick={() => setSelected(null)} className="cursor-pointer shrink-0">
              Fermer
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
              <p className="text-xs text-slate-500 font-medium">Cible</p>
              <p className="font-semibold text-slate-100 mt-1">{selected.target || "-"}</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
              <p className="text-xs text-slate-500 font-medium">Score principal</p>
              <p className="font-semibold text-slate-100 mt-1">
                {selected.precision ?? selected.metrics?.r2_score ?? "-"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
              <p className="text-xs text-slate-500 font-medium">Fichier modèle</p>
              <p className="font-semibold text-slate-100 mt-1 break-all text-xs">{selected.model_file || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
              <p className="text-xs text-slate-500 font-medium" title="Nombre total d appels /api/predict enregistres">
                Appels API
              </p>
              <p className="font-semibold text-slate-100 mt-1" title="Compteur des requetes de prediction">
                {selected.api_stats?.total_predictions ?? 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
              <p className="text-xs text-slate-500 font-medium" title="Appels /api/predict ayant reussi">
                Appels réussis
              </p>
              <p className="font-semibold text-slate-100 mt-1" title="Reponses success: true">
                {selected.api_stats?.success_predictions ?? 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
              <p className="text-xs text-slate-500 font-medium" title="Appels /api/predict en erreur">
                Appels échoués
              </p>
              <p className="font-semibold text-slate-100 mt-1" title="Reponses success: false">
                {selected.api_stats?.failed_predictions ?? 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
              <p className="text-xs text-slate-500 font-medium" title="Combien de fois le payload a ete copie">
                Copies payload
              </p>
              <p className="font-semibold text-slate-100 mt-1" title="Copie du snippet API depuis la fiche ou l onglet API">
                {selected.api_stats?.total_copies ?? 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
              <p className="text-xs text-slate-500 font-medium" title="Part des reponses /api/predict reussies">
                Succes
              </p>
              <p className="font-semibold text-slate-100 mt-1" title="Taux de reussite des appels">
                {selected.api_stats?.success_rate !== null && selected.api_stats?.success_rate !== undefined
                  ? `${Math.round(selected.api_stats.success_rate * 100)}%`
                  : "-"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700" title="Temps moyen pour repondre aux appels">
              <p className="text-xs text-slate-500 font-medium">Latence moyenne</p>
              <p className="font-semibold text-slate-100 mt-1">
                {selected.api_stats?.avg_latency_ms !== null && selected.api_stats?.avg_latency_ms !== undefined
                  ? `${selected.api_stats.avg_latency_ms.toFixed(1)} ms`
                  : "-"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700" title="Charge CPU observee pendant les appels">
              <p className="text-xs text-slate-500 font-medium">CPU moyen</p>
              <p className="font-semibold text-slate-100 mt-1">
                {selected.api_stats?.avg_cpu_percent !== null && selected.api_stats?.avg_cpu_percent !== undefined
                  ? `${selected.api_stats.avg_cpu_percent.toFixed(1)} %`
                  : "-"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700" title="Memoire utilisee pendant les appels">
              <p className="text-xs text-slate-500 font-medium">RAM moyenne</p>
              <p className="font-semibold text-slate-100 mt-1">
                {selected.api_stats?.avg_ram_mb !== null && selected.api_stats?.avg_ram_mb !== undefined
                  ? `${selected.api_stats.avg_ram_mb.toFixed(1)} MB`
                  : "-"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {(() => {
              const modelType = (selected.type || "").toLowerCase().includes("reg") ? "regression" : "classification"
              const metricDefinitions = [
                {
                  key: "accuracy",
                  label: "Accuracy",
                  type: "classification",
                  description: "Part des prédictions correctes sur l'ensemble des classes.",
                },
                {
                  key: "precision",
                  label: "Precision",
                  type: "classification",
                  description: "Parmi les prédictions positives, proportion réellement correcte (faibles faux positifs).",
                },
                {
                  key: "recall",
                  label: "Recall",
                  type: "classification",
                  description: "Proportion de vrais positifs retrouvés (faibles faux négatifs).",
                },
                {
                  key: "f1_score",
                  label: "F1-Score",
                  type: "classification",
                  description: "Moyenne harmonique précision/rappel, équilibre entre faux positifs et faux négatifs.",
                },
                {
                  key: "rmse",
                  label: "RMSE",
                  type: "regression",
                  description: "Racine de l'erreur quadratique moyenne : pénalise fortement les grosses erreurs.",
                },
                {
                  key: "mae",
                  label: "MAE",
                  type: "regression",
                  description: "Erreur absolue moyenne : écart moyen (en valeur absolue) entre prédictions et réalité.",
                },
                {
                  key: "r2_score",
                  label: "R²",
                  type: "regression",
                  description: "Variance expliquée (proche de 1 = très bon ajustement, <0 = moins bon que la moyenne).",
                },
              ] as const

              const filteredMetrics = metricDefinitions.filter((m) => m.type === modelType)

              const formatValue = (v: number | string | undefined) => {
                if (typeof v === "number" && Number.isFinite(v)) return v.toFixed(6)
                if (typeof v === "string") return v
                return "-"
              }

              return filteredMetrics.map((m) => (
                <MetricItem
                  key={m.key}
                  label={m.label}
                  value={formatValue(selected.metrics?.[m.key])}
                  description={m.description}
                />
              ))
            })()}
          </div>

          <div className="text-sm">
            <p className="text-xs text-slate-500 font-medium mb-2">Features</p>
            <p className="text-slate-300">
              {selected.features && selected.features.length ? selected.features.join(", ") : "-"}
            </p>
          </div>

          <div className="space-y-3 bg-slate-900/30 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-100">Rapport</p>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 cursor-pointer text-xs bg-transparent hover:bg-purple-500/10 hover:border-purple-500/50"
                onClick={() => generatePDFReport(selected)}
              >
                <FileDown className="w-3.5 h-3.5 mr-1.5" />
                Télécharger le rapport
              </Button>
            </div>
          </div>

          <div className="space-y-3 bg-slate-900/30 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-100">API de prédiction</p>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 cursor-pointer text-xs bg-transparent"
                onClick={async () => {
                  try {
                    await dashboardAPI.logApiCopy(selected.id)
                  } catch (e) {
                    console.error("log copy failed", e)
                  }
                  const featuresSample = buildFeaturesSample(selected)
                  const body = JSON.stringify(
                    {
                      model_id: selected.id,
                      model_file: selected.model_file || "<model_file>.pkl",
                      features: featuresSample,
                    },
                  )
                  const payloadLines = [
                    "curl -X POST http://localhost:5000/api/predict",
                    '  -H "Content-Type: application/json"',
                    `  -d '${body.replace(/'/g, "\\'")}'`,
                  ]
                  const payload = payloadLines.join(" \\\n")
                  const copied = await copyToClipboard(payload)
                  toast({
                    title: copied ? "Copie réussie" : "Copie échouée",
                    description: copied
                      ? "Snippet curl copié dans le presse-papiers."
                      : "Impossible de copier automatiquement. Copiez-le manuellement.",
                    variant: copied ? "default" : "destructive",
                  })
                }}
              >
                Copier
              </Button>
            </div>
            <pre className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 overflow-x-auto">
              {(() => {
                const featuresSample = buildFeaturesSample(selected)
                const body = JSON.stringify(
                  {
                    model_id: selected.id,
                    model_file: selected.model_file || "<model_file>.pkl",
                    features: featuresSample,
                  },
                )
                const payloadLines = [
                  "curl -X POST http://localhost:5000/api/predict",
                  '  -H "Content-Type: application/json"',
                  `  -d '${body.replace(/'/g, "\\'")}'`,
                ]
                return payloadLines.join(" \\\n")
              })()}
            </pre>
            <p className="text-xs text-slate-400">
              Remplacez les valeurs par vos données réelles. Réponse: {"{ success: true, predictions: [...] }"}.
            </p>
          </div>
        </Card>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full bg-slate-900 border border-red-500/40 shadow-xl shadow-red-500/20 p-6 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-red-200">Confirmer la suppression</p>
              <p className="text-sm text-slate-300">
                Voulez-vous vraiment supprimer <span className="font-semibold text-slate-100">{deleteTarget.name}</span> ?
                Le fichier modèle et les rapports associés seront supprimés. Cette action est irréversible.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-200 hover:bg-slate-800"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Annuler
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-red-500 text-red-200 hover:bg-red-600/10"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {detailsLoading && <p className="text-slate-300 text-center py-4">Chargement des détails...</p>}
    </div>
  )
}

function MetricItem({
  label,
  value,
  description,
}: {
  label: string
  value: number | string | undefined
  description?: string
}) {
  return (
    <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700" title={description || label}>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="font-semibold text-slate-100 mt-1">{value ?? "-"}</p>
    </div>
  )
}
