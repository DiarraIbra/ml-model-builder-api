"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="md:hidden">
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-slate-950/95 backdrop-blur border-b border-slate-700/50 p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Models
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Settings
          </Button>
        </div>
      )}
    </>
  )
}
