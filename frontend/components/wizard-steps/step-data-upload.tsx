"use client"

import type React from "react"

import { useState, useRef } from "react"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Upload, X, CheckCircle } from "lucide-react"
import type { WizardState } from "@/components/model-wizard"

interface StepDataUploadProps {
  state: WizardState
  onUpdate: (updates: Partial<WizardState>) => void
  onNext: () => void
  onPrev: () => void
}

export function StepDataUpload({ state, onUpdate, onNext, onPrev }: StepDataUploadProps) {
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
    <div className="space-y-6">
      {state.csvData.length === 0 ? (
        <>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
              isDragging
                ? "border-purple-500 bg-linear-to-br from-purple-500/20 to-pink-500/10"
                : "border-slate-600 hover:border-purple-500/50 bg-slate-800/30 hover:bg-slate-800/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-10 h-10 mx-auto mb-3 text-purple-400" />
            <p className="text-sm font-medium text-slate-100 mb-1">Drag and drop your CSV file here</p>
            <p className="text-xs text-slate-400 mb-4">or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInputChange}
              onClick={(e) => (e.currentTarget.value = "")}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-purple-500/50 hover:bg-purple-500/20 text-purple-300"
            >
              Select File
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="bg-linear-to-r from-purple-500/20 to-pink-500/10 border border-purple-500/50 rounded-lg p-4 backdrop-blur">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-400" />
                <p className="text-sm font-medium text-slate-100">File uploaded successfully</p>
              </div>
              <Button variant="ghost" size="sm" onClick={clearData} className="h-6 w-6 p-0 hover:bg-slate-700">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <p>Rows: {state.csvData.length}</p>
              <p>Columns: {state.csvColumns.length}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-100">Preview</p>
            <div className="border border-slate-700 rounded-lg overflow-x-auto max-h-48 overflow-y-auto bg-slate-800/30">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-800 border-b border-slate-700">
                  <tr>
                    {state.csvColumns.map((col: string, i: number) => (
                      <th key={i} className="px-3 py-2 text-left font-semibold text-purple-300">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.csvData.slice(0, 5).map((row: string[], i: number) => (
                    <tr key={i} className="border-b border-slate-700 hover:bg-slate-700/30 last:border-b-0">
                      {row.map((cell: string, j: number) => (
                        <td key={j} className="px-3 py-2 text-slate-400">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onPrev} className="border-slate-600 hover:bg-slate-800 bg-transparent">
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={state.csvData.length === 0}
          className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/50 disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
