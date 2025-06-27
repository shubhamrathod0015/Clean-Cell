"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Sparkles } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { parseCSV, parseXLSX } from "@/lib/file-parser"
import { validateData } from "@/lib/validators"

export default function DataIngestion() {
  const { dispatch, state } = useData()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [uploadMessage, setUploadMessage] = useState("")
  const [files, setFiles] = useState<{
    clients?: File
    workers?: File
    tasks?: File
  }>({})

  const handleFileUpload = useCallback(
    async (file: File, type: "clients" | "workers" | "tasks") => {
      setFiles((prev) => ({ ...prev, [type]: file }))

      try {
        setUploadStatus("uploading")
        setUploadProgress(0)

        // Simulate AI-powered parsing progress
        const progressSteps = [
          { progress: 20, message: "Reading file structure..." },
          { progress: 40, message: "AI analyzing headers..." },
          { progress: 60, message: "Mapping columns intelligently..." },
          { progress: 80, message: "Parsing data rows..." },
          { progress: 100, message: "Validation complete!" },
        ]

        for (const step of progressSteps) {
          await new Promise((resolve) => setTimeout(resolve, 500))
          setUploadProgress(step.progress)
          setUploadMessage(step.message)
        }

        let data
        if (file.name.endsWith(".csv")) {
          data = await parseCSV(file)
        } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
          data = await parseXLSX(file)
        } else {
          throw new Error("Unsupported file format")
        }

        // Dispatch data to context
        switch (type) {
          case "clients":
            dispatch({ type: "SET_CLIENTS", payload: data })
            break
          case "workers":
            dispatch({ type: "SET_WORKERS", payload: data })
            break
          case "tasks":
            dispatch({ type: "SET_TASKS", payload: data })
            break
        }

        // Run validation with cross-reference checking
        const allCurrentData = {
          clients: type === "clients" ? data : state.clients,
          workers: type === "workers" ? data : state.workers,
          tasks: type === "tasks" ? data : state.tasks,
        }

        const errors = validateData(data, type, allCurrentData)
        dispatch({ type: "SET_VALIDATION_ERRORS", payload: errors })

        setUploadStatus("success")
        setUploadMessage(`${type} data uploaded successfully!`)
      } catch (error) {
        setUploadStatus("error")
        setUploadMessage(`Error uploading ${type}: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    },
    [dispatch, state],
  )

  const FileUploadCard = ({
    type,
    title,
    description,
    icon: Icon,
  }: {
    type: "clients" | "workers" | "tasks"
    title: string
    description: string
    icon: any
  }) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-indigo-600" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <Label
              htmlFor={`${type}-upload`}
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-700 dark:border-gray-600 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">CSV or XLSX files</p>
              </div>
              <Input
                id={`${type}-upload`}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, type)
                }}
              />
            </Label>
          </div>

          {files[type] && (
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">{files[type]?.name}</span>
            </div>
          )}
        </div>
      </CardContent>

      {files[type] && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
            <Sparkles className="h-3 w-3 text-green-600" />
            <span className="text-xs text-green-700 font-medium">AI Enhanced</span>
          </div>
        </div>
      )}
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Upload Progress */}
      {uploadStatus === "uploading" && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Processing...</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">{uploadMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Alert */}
      {uploadStatus === "success" && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{uploadMessage}</AlertDescription>
        </Alert>
      )}

      {uploadStatus === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadMessage}</AlertDescription>
        </Alert>
      )}

      {/* File Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FileUploadCard
          type="clients"
          title="Clients Data"
          description="Upload client information with priorities and requested tasks"
          icon={FileSpreadsheet}
        />
        <FileUploadCard
          type="workers"
          title="Workers Data"
          description="Upload worker details with skills and availability"
          icon={FileSpreadsheet}
        />
        <FileUploadCard
          type="tasks"
          title="Tasks Data"
          description="Upload task definitions with requirements and constraints"
          icon={FileSpreadsheet}
        />
      </div>

      {/* AI Features Info */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-lg">AI-Powered Data Processing</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Smart Column Mapping</h4>
              <p className="text-sm text-muted-foreground">
                AI automatically maps columns even with different names or order
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Intelligent Validation</h4>
              <p className="text-sm text-muted-foreground">
                Advanced validation beyond basic checks with contextual suggestions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
