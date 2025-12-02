"use client"

import { Card } from "@/components/ui/card"

const features = [
  { name: "Age", type: "Numeric", mean: 42.5, std: 15.3 },
  { name: "Income", type: "Numeric", mean: 65000, std: 25000 },
  { name: "Credit Score", type: "Numeric", mean: 720, std: 80 },
  { name: "Employment Years", type: "Numeric", mean: 8.2, std: 6.5 },
  { name: "Marital Status", type: "Categorical", categories: ["Single", "Married", "Divorced"] },
  { name: "Location", type: "Categorical", categories: ["Urban", "Suburban", "Rural"] },
  { name: "Education", type: "Categorical", categories: ["HS", "BS", "MS", "PhD"] },
  { name: "Job Title", type: "Categorical", categories: ["Manager", "Analyst", "Engineer", "Other"] },
]

export function FeaturesTab() {
  return (
    <div className="space-y-4 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <Card
            key={feature.name}
            className="bg-slate-900/40 border-slate-700/50 p-4 hover:border-purple-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-white">{feature.name}</h4>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  feature.type === "Numeric" ? "bg-blue-500/20 text-blue-300" : "bg-purple-500/20 text-purple-300"
                }`}
              >
                {feature.type}
              </span>
            </div>

            {feature.type === "Numeric" && (
              <div className="space-y-1 text-sm text-slate-400">
                <p>
                  Mean: <span className="text-slate-200">{feature.mean}</span>
                </p>
                <p>
                  Std Dev: <span className="text-slate-200">{feature.std}</span>
                </p>
              </div>
            )}

            {feature.type === "Categorical" && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {feature.categories?.map((cat) => (
                    <span
                      key={cat}
                      className="text-xs bg-slate-800/50 text-slate-300 px-2 py-1 rounded border border-slate-700/50"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
