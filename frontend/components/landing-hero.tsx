"use client"

import { useEffect, useRef, useState } from "react"
import { Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { dashboardAPI } from "@/src/services/api"
import { ModelList } from "@/components/models/model-list"

interface LandingHeroProps {
  onCreateClick: () => void
}

type Stats = {
  total_models: number
  classification_models: number
  regression_models: number
  average_precision: number | null
}

export function LandingHero({ onCreateClick }: LandingHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Background animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    interface Particle {
      x: number
      y: number
      z: number
      vx: number
      vy: number
      vz: number
      size: number
    }

    const particles: Particle[] = []
    const particleCount = 80
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 400 - 200,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
      })
    }

    const animate = () => {
      ctx.fillStyle = "rgba(10, 10, 15, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        p.z += p.vz
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        if (p.z < -200) p.z = 200

        const scale = 400 / (400 + p.z)
        const x = (p.x - canvas.width / 2) * scale + canvas.width / 2
        const y = (p.y - canvas.height / 2) * scale + canvas.height / 2

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, p.size * scale * 2)
        gradient.addColorStop(0, `rgba(59, 130, 246, ${0.8 * scale})`)
        gradient.addColorStop(1, "rgba(59, 130, 246, 0)")
        ctx.fillStyle = gradient
        ctx.fillRect(x - p.size * scale, y - p.size * scale, p.size * scale * 2, p.size * scale * 2)

        particles.forEach((p2, j) => {
          if (j <= i) return
          const dx = p2.x - p.x
          const dy = p2.y - p.y
          const dz = p2.z - p.z
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
          if (dist < 150) {
            ctx.strokeStyle = `rgba(99, 102, 241, ${(1 - dist / 150) * 0.2})`
            ctx.lineWidth = 1
            ctx.beginPath()
            const scale1 = 400 / (400 + p.z)
            const x1 = (p.x - canvas.width / 2) * scale1 + canvas.width / 2
            const y1 = (p.y - canvas.height / 2) * scale1 + canvas.height / 2
            const scale2 = 400 / (400 + p2.z)
            const x2 = (p2.x - canvas.width / 2) * scale2 + canvas.width / 2
            const y2 = (p2.y - canvas.height / 2) * scale2 + canvas.height / 2
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()
          }
        })
      })
      requestAnimationFrame(animate)
    }
    animate()
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [])

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await dashboardAPI.getGlobalStats()
        if (data && data.success !== false) {
          setStats(data as Stats)
        } else {
          setError("Unable to load statistics")
        }
      } catch (err) {
        console.error(err)
        setError("Unable to load statistics")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-primary to-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
      <div
        className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-br from-secondary to-accent rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-br from-primary/50 to-secondary/50 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"
        style={{ animationDelay: "4s" }}
      ></div>

      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 text-center max-w-5xl px-6 space-y-8 pb-20 animate-slide-up">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">AI-Powered ML Model Builder</span>
        </div>

        {/* Heading and description */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent leading-tight">
            Create Powerful ML Models
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Create, train, and deploy machine learning models without writing a single line of code. Powered by
            cutting-edge algorithms and modern AI technology.
          </p>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onCreateClick}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create a New Model
        </Button>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 pt-8">
          <MetricCard
            label="Total Models"
            value={stats ? String(stats.total_models) : loading ? "..." : "-"}
            loading={loading}
            error={!!error}
          />
          <MetricCard
            label="Classification"
            value={stats ? String(stats.classification_models) : loading ? "..." : "-"}
            loading={loading}
            error={!!error}
          />
          <MetricCard
            label="Regression"
            value={stats ? String(stats.regression_models) : loading ? "..." : "-"}
            loading={loading}
            error={!!error}
          />
          <MetricCard
            label="Average Precision"
            value={
              stats && stats.average_precision !== null
                ? `${Math.round(stats.average_precision * 100)}%`
                : loading
                  ? "..."
                  : "-"
            }
            loading={loading}
            error={!!error}
          />
        </div>

        {/* Models List */}
        <div className="w-full mt-16">
          <div className="bg-card/50 rounded-2xl border border-border/50 shadow-xl backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-6 py-10">
              <ModelList />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  loading,
  error,
}: {
  label: string
  value: string
  loading?: boolean
  error?: boolean
}) {
  return (
    <div className="group relative animate-slide-up">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      <div className="relative bg-card/60 backdrop-blur border border-border/50 rounded-lg p-4 hover:border-primary/50 transition-all duration-300">
        <div className="text-3xl font-bold text-primary mb-2">{value}</div>
        <p className="text-sm text-muted-foreground">{loading ? "Loading..." : error ? "Error" : label}</p>
      </div>
    </div>
  )
}
