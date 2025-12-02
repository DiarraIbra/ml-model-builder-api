"use client"

import type { ReactNode } from "react"

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
}

export function ResponsiveContainer({ children, className = "" }: ResponsiveContainerProps) {
  return <div className={`w-full px-4 sm:px-6 md:px-8 max-w-7xl mx-auto ${className}`}>{children}</div>
}
