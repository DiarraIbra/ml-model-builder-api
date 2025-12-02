"use client"

import { useEffect, useState } from "react"

interface AnimatedMetricCardProps {
  label: string
  finalValue: number
  icon: string
  suffix?: string
}

export function AnimatedMetricCard({ label, finalValue, icon, suffix = "" }: AnimatedMetricCardProps) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = finalValue / 30
    const timer = setInterval(() => {
      start += increment
      if (start >= finalValue) {
        setValue(finalValue)
        clearInterval(timer)
      } else {
        setValue(Math.floor(start))
      }
    }, 30)
    return () => clearInterval(timer)
  }, [finalValue])

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-linear-to-r from-purple-600/20 to-pink-600/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
      <div className="relative bg-slate-900/40 backdrop-blur border border-slate-700/50 rounded-lg p-4 hover:border-purple-500/50 transition-all duration-300">
        <div className="text-2xl mb-2">{icon}</div>
        <div className="text-3xl font-bold text-transparent bg-linear-to-r from-purple-300 to-pink-300 bg-clip-text mb-1">
          {value}
          {suffix}
        </div>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </div>
  )
}
