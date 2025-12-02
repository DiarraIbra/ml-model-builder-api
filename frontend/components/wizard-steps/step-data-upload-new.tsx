"use client"

import type React from "react"
import { useState, useRef } from "react"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Upload, X, CheckCircle, File } from "lucide-react"
import type { WizardState } from "@/components/model-wizard"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

interface StepDataUploadProps {
  state: WizardState
  onUpdate: (updates: Partial<WizardState>) => void
  onNext: () => void
  onPrev: () => void
}

export function StepDataUploadNew({ state, onUpdate, onNext, onPrev }: StepDataUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a CSV file")
      return
    }

    Papa.parse(file, {
      dynamicTyping: false,
      header: false,
      skipEmptyLines: true,
      complete: (results: any) => {
        if (results.data && results.data.length > 0) {
          const rawColumns = results.data[0]
          const columns = rawColumns.map((c: string) =>
            String(c)
              .replace(/^\s*"|"\s*$|^\s*'|'\s*$/g, "")
              .trim(),
          )
          const data = results.data
          onUpdate({
            csvColumns: columns,
            csvData: data,
          })
        }
      },
      error: (error: any) => {
        alert(`Error parsing file: ${error.message}`)
      },
    })
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  const clearData = () => {
    onUpdate({
      csvData: [],
      csvColumns: [],
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Upload Your Data</h1>
          <p className="text-lg text-slate-400">Import a CSV file to train your model</p>
        </div>

        {state.csvData.length === 0 ? (
          <>
            {/* Upload Zone */}
            <div
              className={`
                border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer
                ${
                  isDragging
                    ? "border-purple-500 bg-gradient-to-br from-purple-500/20 to-pink-500/10 scale-105"
                    : "border-slate-600 hover:border-purple-500/50 bg-slate-900/30 hover:bg-slate-900/50"
                }
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full">
                    <Upload className="w-12 h-12 text-purple-400" />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-100 mb-1">Drag and drop your CSV file</p>
                  <p className="text-sm text-slate-400">or click to browse your files</p>
                </div>
                <p className="text-xs text-slate-500">Supported format: CSV (Comma-Separated Values)</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInputChange}
                onClick={(e) => (e.currentTarget.value = "")}
                className="hidden"
              />
            </div>
          </>
        ) : (
          <>
            {/* Success state */}
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">File uploaded successfully</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {state.csvData.length} rows, {state.csvColumns.length} columns
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearData}
                  className="h-8 w-8 p-0 hover:bg-red-500/20 text-red-400"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            {/* Data preview */}
            <Card className="bg-slate-900/40 border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <File className="w-5 h-5 text-purple-400" />
                Data Preview
              </h3>
              <div className="border border-slate-700 rounded-lg overflow-x-auto max-h-64 overflow-y-auto bg-slate-800/30">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-800 border-b border-slate-700">
                    <tr>
                      {state.csvColumns.map((col: string, i: number) => (
                        <th key={i} className="px-4 py-3 text-left font-semibold text-purple-300">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {state.csvData.slice(0, 8).map((row: string[], i: number) => (
                      <tr key={i} className="border-b border-slate-700 hover:bg-slate-700/20 last:border-b-0">
                        {row.map((cell: string, j: number) => (
                          <td key={j} className="px-4 py-2 text-slate-400">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-6">
          <Button
            variant="outline"
            onClick={onPrev}
            className="flex-1 h-11 border-slate-600 hover:bg-slate-800/50 text-slate-300 bg-transparent"
          >
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={state.csvData.length === 0}
            className="flex-1 h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/50 disabled:opacity-50 disabled:shadow-none gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
