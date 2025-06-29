"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, FileText, CheckCircle, Box, Cpu, Database, FileCode } from "lucide-react"
import { useData } from "@/contexts/data-context"

export default function ExportPanel() {
  const { state } = useData()
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportComplete, setExportComplete] = useState(false)

  // Restored original functions
  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)
    setExportComplete(false)

    const steps = [
      { progress: 20, message: "Validating data integrity..." },
      { progress: 40, message: "Cleaning and formatting data..." },
      { progress: 60, message: "Generating rules configuration..." },
      { progress: 80, message: "Creating export package..." },
      { progress: 100, message: "Export complete!" },
    ]

    try {
      for (const step of steps) {
        await new Promise((resolve) => setTimeout(resolve, 800))
        setExportProgress(step.progress)
      }

      // Generate and download files
      await generateExportFiles()
      setExportComplete(true)
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const generateExportFiles = async () => {
    // Generate cleaned CSV files
    const clientsCSV = generateCSV(state.clients, "clients")
    const workersCSV = generateCSV(state.workers, "workers")
    const tasksCSV = generateCSV(state.tasks, "tasks")

    // Generate rules JSON
    const rulesConfig = {
      rules: state.rules.filter((rule) => rule.active),
      priorities: state.priorities,
      metadata: {
        exportDate: new Date().toISOString(),
        totalClients: state.clients.length,
        totalWorkers: state.workers.length,
        totalTasks: state.tasks.length,
        validationErrors: state.validationErrors.length,
      },
    }

    // Create and download files
    downloadFile(clientsCSV, "clients_cleaned.csv", "text/csv")
    downloadFile(workersCSV, "workers_cleaned.csv", "text/csv")
    downloadFile(tasksCSV, "tasks_cleaned.csv", "text/csv")
    downloadFile(JSON.stringify(rulesConfig, null, 2), "rules_config.json", "application/json")
  }

  const generateCSV = (data: any[], type: string) => {
    if (data.length === 0) return ""

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            if (Array.isArray(value)) {
              return `"${value.join(", ")}"`
            }
            return typeof value === "string" && value.includes(",") ? `"${value}"` : value
          })
          .join(","),
      ),
    ].join("\n")

    return csvContent
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const hasData = state.clients.length > 0 || state.workers.length > 0 || state.tasks.length > 0
  const hasErrors = state.validationErrors.some((e) => e.severity === "error")

  return (
    <div className="space-y-6">
      {/* Export Card - New Design */}
      <Card className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
              <Cpu className="h-6 w-6 text-cyan-700 dark:text-cyan-300" />
            </div>
            <div>
              <CardTitle>Generate Data Package</CardTitle>
              <CardDescription className="mt-1">
                Export validated datasets and business rules for deployment
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-5">
          {/* Data Summary - New Layout */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center p-3 bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/50 dark:to-cyan-800/30 rounded-lg border border-cyan-100 dark:border-cyan-800">
              <span className="text-xl font-bold text-cyan-700 dark:text-cyan-300">{state.clients.length}</span>
              <span className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">Clients</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/50 dark:to-emerald-800/30 rounded-lg border border-emerald-100 dark:border-emerald-800">
              <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{state.workers.length}</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Workers</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gradient-to-r from-violet-50 to-violet-100 dark:from-violet-900/50 dark:to-violet-800/30 rounded-lg border border-violet-100 dark:border-violet-800">
              <span className="text-xl font-bold text-violet-700 dark:text-violet-300">{state.tasks.length}</span>
              <span className="text-xs text-violet-600 dark:text-violet-400 mt-1">Tasks</span>
            </div>
          </div>

          {/* Status Indicators - New Design */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800/30">
              <h4 className="font-medium flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${hasErrors ? 'bg-red-500' : 'bg-green-500'}`}></span>
                Data Quality
              </h4>
              <p className="text-xs mt-1 text-muted-foreground">
                {hasErrors 
                  ? `${state.validationErrors.filter((e) => e.severity === "error").length} issues found` 
                  : 'No critical issues'}
              </p>
            </div>
            
            <div className="p-3 rounded-lg border bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800/30">
              <h4 className="font-medium">Business Rules</h4>
              <p className="text-xs mt-1 text-muted-foreground">
                {state.rules.filter((r) => r.active).length} active rules
              </p>
            </div>
          </div>

          {/* Export Progress - Redesigned */}
          {isExporting && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Processing data package</span>
                <span className="text-cyan-600 dark:text-cyan-400">{exportProgress}%</span>
              </div>
              <Progress 
                value={exportProgress} 
                className="h-2 bg-gray-200 dark:bg-gray-700 [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-blue-500"
              />
            </div>
          )}

          {/* Export Success - New Design */}
          {exportComplete && (
            <Alert className="border-green-500 bg-gradient-to-r from-green-50 to-white dark:from-green-900/30 dark:to-green-900/10">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                Package generated successfully! Files downloaded to your device.
              </AlertDescription>
            </Alert>
          )}

          {/* Export Button - New Style */}
          <Button 
            onClick={handleExport} 
            disabled={!hasData || isExporting} 
            className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg transition-all"
            size="lg"
          >
            {isExporting ? (
              <span className="flex items-center">
                <Box className="h-4 w-4 mr-2 animate-pulse" />
                Packaging Data...
              </span>
            ) : (
              <span className="flex items-center">
                <Database className="h-4 w-4 mr-2" />
                Generate Export Package
              </span>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Export Contents - New Layout */}
      <Card className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileCode className="h-6 w-6 text-blue-700 dark:text-blue-300" />
            </div>
            <div>
              <CardTitle>Package Contents</CardTitle>
              <CardDescription>Files included in the data export package</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 border rounded-lg flex items-center gap-3 bg-white dark:bg-gray-800/50">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/50 rounded-md">
                <FileText className="h-5 w-5 text-cyan-700 dark:text-cyan-400" />
              </div>
              <div>
                <div className="font-medium">clients_cleaned.csv</div>
                <div className="text-xs text-muted-foreground">Sanitized client records</div>
              </div>
            </div>
            
            <div className="p-3 border rounded-lg flex items-center gap-3 bg-white dark:bg-gray-800/50">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-md">
                <FileText className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div>
                <div className="font-medium">workers_cleaned.csv</div>
                <div className="text-xs text-muted-foreground">Verified worker profiles</div>
              </div>
            </div>
            
            <div className="p-3 border rounded-lg flex items-center gap-3 bg-white dark:bg-gray-800/50">
              <div className="p-2 bg-violet-100 dark:bg-violet-900/50 rounded-md">
                <FileText className="h-5 w-5 text-violet-700 dark:text-violet-400" />
              </div>
              <div>
                <div className="font-medium">tasks_cleaned.csv</div>
                <div className="text-xs text-muted-foreground">Processed task assignments</div>
              </div>
            </div>
            
            <div className="p-3 border rounded-lg flex items-center gap-3 bg-white dark:bg-gray-800/50">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-md">
                <FileCode className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium">rules_config.json</div>
                <div className="text-xs text-muted-foreground">Business logic configuration</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}