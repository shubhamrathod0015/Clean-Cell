"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, FileText, CheckCircle, Package, Sparkles } from "lucide-react"
import { useData } from "@/contexts/data-context"

export default function ExportPanel() {
  const { state } = useData()
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportComplete, setExportComplete] = useState(false)

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
      {/* Export Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            <CardTitle>Export Data Package</CardTitle>
          </div>
          <CardDescription>Download cleaned data and rules configuration for downstream processing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Data Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{state.clients.length}</div>
              <div className="text-sm text-muted-foreground">Clients</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{state.workers.length}</div>
              <div className="text-sm text-muted-foreground">Workers</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{state.tasks.length}</div>
              <div className="text-sm text-muted-foreground">Tasks</div>
            </div>
          </div>

          {/* Validation Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Data Quality Status</h4>
              <p className="text-sm text-muted-foreground">
                {hasErrors ? "Some validation errors need attention" : "All validations passed"}
              </p>
            </div>
            <Badge variant={hasErrors ? "destructive" : "default"}>
              {hasErrors ? `${state.validationErrors.filter((e) => e.severity === "error").length} Errors` : "Clean"}
            </Badge>
          </div>

          {/* Rules Summary */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Business Rules</h4>
              <p className="text-sm text-muted-foreground">
                {state.rules.filter((r) => r.active).length} active rules configured
              </p>
            </div>
            <Badge variant="secondary">{state.rules.length} Total</Badge>
          </div>

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Exporting...</span>
                <span className="text-sm text-muted-foreground">{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          )}

          {/* Export Success */}
          {exportComplete && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Export completed successfully! Files have been downloaded to your device.
              </AlertDescription>
            </Alert>
          )}

          {/* Export Button */}
          <Button onClick={handleExport} disabled={!hasData || isExporting} className="w-full" size="lg">
            {isExporting ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-pulse" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Data Package
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Export Contents */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            <CardTitle>Export Contents</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="font-medium">clients_cleaned.csv</div>
                  <div className="text-sm text-muted-foreground">Validated client data</div>
                </div>
              </div>
              <Badge variant="outline">CSV</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-green-600" />
                <div>
                  <div className="font-medium">workers_cleaned.csv</div>
                  <div className="text-sm text-muted-foreground">Validated worker data</div>
                </div>
              </div>
              <Badge variant="outline">CSV</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="font-medium">tasks_cleaned.csv</div>
                  <div className="text-sm text-muted-foreground">Validated task data</div>
                </div>
              </div>
              <Badge variant="outline">CSV</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <div>
                  <div className="font-medium">rules_config.json</div>
                  <div className="text-sm text-muted-foreground">Business rules and priorities</div>
                </div>
              </div>
              <Badge variant="outline">JSON</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
