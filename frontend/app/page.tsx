"use client"

import { useState } from "react"
import { LandingHero } from "@/components/landing-hero"
import { ModelWizardNew } from "@/components/model-wizard-new"

export default function Home() {
  const [wizardOpen, setWizardOpen] = useState(false)

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      {!wizardOpen ? (
        <LandingHero onCreateClick={() => setWizardOpen(true)} />
      ) : (
        <ModelWizardNew isOpen={wizardOpen} onClose={() => setWizardOpen(false)} />
      )}
    </main>
  )
}
