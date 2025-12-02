"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Card } from "@/components/ui/card"

const confusionMatrixData = [
  { name: "True Neg", value: 940 },
  { name: "False Pos", value: 60 },
  { name: "False Neg", value: 30 },
  { name: "True Pos", value: 970 },
]

const precisionRecallData = [
  { threshold: 0.3, precision: 0.82, recall: 0.95 },
  { threshold: 0.4, precision: 0.85, recall: 0.93 },
  { threshold: 0.5, precision: 0.88, recall: 0.9 },
  { threshold: 0.6, precision: 0.91, recall: 0.86 },
  { threshold: 0.7, precision: 0.93, recall: 0.82 },
  { threshold: 0.8, precision: 0.95, recall: 0.76 },
]

const performanceData = [
  { metric: "Accuracy", value: 94, fullMark: 100 },
  { metric: "Precision", value: 88, fullMark: 100 },
  { metric: "Recall", value: 90, fullMark: 100 },
  { metric: "F1-Score", value: 89, fullMark: 100 },
]

const classDistribution = [
  { name: "Class A", value: 45, fill: "#3b82f6" },
  { name: "Class B", value: 35, fill: "#8b5cf6" },
  { name: "Class C", value: 20, fill: "#ec4899" },
]

export function MetricsTab() {
  return (
    <div className="space-y-6 pb-8">
      {/* Top metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Accuracy" value="94.2%" color="text-green-400" />
        <MetricCard label="Precision" value="88.5%" color="text-blue-400" />
        <MetricCard label="Recall" value="90.3%" color="text-purple-400" />
        <MetricCard label="F1-Score" value="89.4%" color="text-pink-400" />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <Card className="bg-slate-900/40 border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Confusion Matrix</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={confusionMatrixData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
              <XAxis dataKey="name" stroke="rgb(148,163,184)" />
              <YAxis stroke="rgb(148,163,184)" />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(15,23,42,0.9)", border: "1px solid rgba(100,116,139,0.5)" }}
              />
              <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Precision-Recall Curve */}
        <Card className="bg-slate-900/40 border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Precision-Recall Curve</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={precisionRecallData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
              <XAxis dataKey="threshold" stroke="rgb(148,163,184)" />
              <YAxis stroke="rgb(148,163,184)" />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(15,23,42,0.9)", border: "1px solid rgba(100,116,139,0.5)" }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Line type="monotone" dataKey="precision" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="recall" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Performance Radar */}
        <Card className="bg-slate-900/40 border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={performanceData}>
              <PolarGrid stroke="rgba(100,116,139,0.3)" />
              <PolarAngleAxis dataKey="metric" stroke="rgb(148,163,184)" />
              <PolarRadiusAxis stroke="rgb(148,163,184)" />
              <Radar name="Score" dataKey="value" stroke="#ec4899" fill="#ec4899" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* Class Distribution */}
        <Card className="bg-slate-900/40 border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Class Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={classDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {classDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(15,23,42,0.9)", border: "1px solid rgba(100,116,139,0.5)" }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border-slate-700/50 p-4">
      <p className="text-sm text-slate-400 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </Card>
  )
}
