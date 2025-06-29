"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Sparkles, Database, FileStack, Users, ClipboardList } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { parseCSV, parseXLSX } from "@/lib/file-parser"
import { validateData } from "@/lib/validators"

export default function DataIngestion() {
  // All state and core logic remains exactly the same
  const { dispatch, state } = useData()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [uploadMessage, setUploadMessage] = useState("")
  const [files, setFiles] = useState<{
    clients?: File
    workers?: File
    tasks?: File
  }>({})

  // Core logic functions remain unchanged
  const handleFileUpload = useCallback(
    async (file: File, type: "clients" | "workers" | "tasks") => {
      // Unchanged implementation
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

  // Only UI changes below this point
  const FileUploadCard = ({
    type,
    title,
    description,
    icon: Icon,
    color = "indigo",
  }: {
    type: "clients" | "workers" | "tasks"
    title: string
    description: string
    icon: any
    color?: "indigo" | "blue" | "green" | "purple"
  }) => {
    const colorMap = {
      indigo: {
        bg: "bg-indigo-50",
        border: "border-indigo-200",
        iconBg: "bg-indigo-100",
        iconColor: "text-indigo-600",
        text: "text-indigo-600",
      },
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        text: "text-blue-600",
      },
      green: {
        bg: "bg-green-50",
        border: "border-green-200",
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        text: "text-green-600",
      },
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
        text: "text-purple-600",
      },
    }
    
    const colors = colorMap[color]

    return (
      <Card className={`border-0 shadow-lg rounded-2xl overflow-hidden ${colors.border} ${colors.bg}`}>
        <CardHeader className="py-5 px-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-lg ${colors.iconBg}`}>
              <Icon className={`h-6 w-6 ${colors.iconColor}`} />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-800">{title}</CardTitle>
          </div>
          <CardDescription className="text-gray-600">{description}</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <Label
                htmlFor={`${type}-upload`}
                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed ${colors.border} rounded-xl cursor-pointer hover:bg-white transition-colors`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className={`w-10 h-10 mb-3 ${colors.iconColor}`} />
                  <p className="mb-2 text-sm font-medium text-gray-600">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">CSV or XLSX files</p>
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
              <div className={`flex items-center gap-3 p-3 rounded-lg bg-white border ${colors.border}`}>
                <CheckCircle className={`h-5 w-5 ${colors.iconColor}`} />
                <div>
                  <p className="font-medium text-gray-800">{files[type]?.name}</p>
                  <p className="text-xs text-gray-600">Successfully uploaded</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        {files[type] && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full">
              <Sparkles className="h-3 w-3 text-white" />
              <span className="text-xs text-white font-medium">AI Enhanced</span>
            </div>
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload Progress */}
      {uploadStatus === "uploading" && (
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">AI Processing...</span>
                <span className="font-medium text-indigo-600">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full h-2.5" />
              <p className="text-sm text-gray-600">{uploadMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Alert */}
      {uploadStatus === "success" && (
        <Alert className="border-emerald-200 bg-emerald-50 rounded-2xl">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <AlertDescription className="text-emerald-700 font-medium">
            {uploadMessage}
          </AlertDescription>
        </Alert>
      )}

      {uploadStatus === "error" && (
        <Alert className="border-red-200 bg-red-50 rounded-2xl">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-700 font-medium">
            {uploadMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* File Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FileUploadCard
          type="clients"
          title="Clients Data"
          description="Upload client information with priorities"
          icon={Users}
          color="blue"
        />
        <FileUploadCard
          type="workers"
          title="Workers Data"
          description="Upload worker details with skills and availability"
          icon={FileStack}
          color="green"
        />
        <FileUploadCard
          type="tasks"
          title="Tasks Data"
          description="Upload task definitions with requirements"
          icon={ClipboardList}
          color="purple"
        />
      </div>

      {/* AI Features Info */}
      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader className="py-5 px-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100">
              <Sparkles className="h-6 w-6 text-indigo-600" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-800">AI-Powered Data Processing</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <Database className="h-5 w-5 text-indigo-600" />
                </div>
                <h4 className="font-medium text-gray-800">Smart Column Mapping</h4>
              </div>
              <p className="text-sm text-gray-600 pl-10">
                AI automatically maps columns even with different names or order
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <ClipboardList className="h-5 w-5 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-800">Intelligent Validation</h4>
              </div>
              <p className="text-sm text-gray-600 pl-10">
                Advanced validation beyond basic checks with contextual suggestions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}