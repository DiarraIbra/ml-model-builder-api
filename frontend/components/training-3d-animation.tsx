"use client"

import { useEffect, useRef } from "react"

interface Training3DAnimationProps {
  isComplete: boolean
}

export function Training3DAnimation({ isComplete }: Training3DAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const canvas = document.createElement("canvas")
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    container.appendChild(canvas)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let time = 0

    interface Node {
      x: number
      y: number
      z: number
      vx: number
      vy: number
      vz: number
      size: number
    }

    // Create network nodes
    const nodes: Node[] = []
    const nodeCount = 20

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 300 - 150,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2 + 1,
      })
    }

    const animate = () => {
      time += 1

      // Clear with fade
      ctx.fillStyle = "rgba(15, 23, 42, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw nodes
      nodes.forEach((node) => {
        node.x += node.vx
        node.y += node.vy
        node.z += node.vz

        // Wrap around
        if (node.x < 0) node.x = canvas.width
        if (node.x > canvas.width) node.x = 0
        if (node.y < 0) node.y = canvas.height
        if (node.y > canvas.height) node.y = 0
        if (node.z < -150) node.z = 150
        if (node.z > 150) node.z = -150

        // Perspective projection
        const scale = 200 / (200 + node.z)
        const screenX = (node.x - canvas.width / 2) * scale + canvas.width / 2
        const screenY = (node.y - canvas.height / 2) * scale + canvas.height / 2

        // Draw pulse if animating
        if (!isComplete) {
          const pulseSize = node.size * scale * (1 + Math.sin(time * 0.05 + node.z) * 0.3)

          // Outer glow
          const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, pulseSize * 3)
          gradient.addColorStop(0, `rgba(99, 102, 241, ${0.4 * scale})`)
          gradient.addColorStop(0.5, `rgba(99, 102, 241, ${0.1 * scale})`)
          gradient.addColorStop(1, "rgba(99, 102, 241, 0)")

          ctx.fillStyle = gradient
          ctx.fillRect(screenX - pulseSize * 3, screenY - pulseSize * 3, pulseSize * 6, pulseSize * 6)
        }

        // Core node
        const nodeGradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, node.size * scale * 2)

        if (isComplete) {
          nodeGradient.addColorStop(0, `rgba(16, 185, 129, ${0.8 * scale})`)
          nodeGradient.addColorStop(1, `rgba(16, 185, 129, 0)`)
        } else {
          nodeGradient.addColorStop(0, `rgba(99, 102, 241, ${0.8 * scale})`)
          nodeGradient.addColorStop(1, `rgba(99, 102, 241, 0)`)
        }

        ctx.fillStyle = nodeGradient
        ctx.fillRect(
          screenX - node.size * scale * 2,
          screenY - node.size * scale * 2,
          node.size * scale * 4,
          node.size * scale * 4,
        )
      })

      // Draw connections (only when not complete)
      if (!isComplete) {
        nodes.forEach((node1, i) => {
          nodes.slice(i + 1).forEach((node2) => {
            const dx = node2.x - node1.x
            const dy = node2.y - node1.y
            const dz = node2.z - node1.z
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

            if (dist < 200) {
              const scale1 = 200 / (200 + node1.z)
              const screenX1 = (node1.x - canvas.width / 2) * scale1 + canvas.width / 2
              const screenY1 = (node1.y - canvas.height / 2) * scale1 + canvas.height / 2

              const scale2 = 200 / (200 + node2.z)
              const screenX2 = (node2.x - canvas.width / 2) * scale2 + canvas.width / 2
              const screenY2 = (node2.y - canvas.height / 2) * scale2 + canvas.height / 2

              ctx.strokeStyle = `rgba(99, 102, 241, ${(1 - dist / 200) * 0.2})`
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(screenX1, screenY1)
              ctx.lineTo(screenX2, screenY2)
              ctx.stroke()
            }
          })
        })
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      const newRect = container.getBoundingClientRect()
      canvas.width = newRect.width
      canvas.height = newRect.height
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", handleResize)
      canvas.remove()
    }
  }, [isComplete])

  return <div ref={containerRef} className="w-full h-full absolute inset-0" />
}
