"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, CheckCircle, AlertTriangle, Shield } from "lucide-react"
import { useData } from "@/contexts/data-context"

export default function ValidationSummary() {
  const { state } = useData()

  const errorCount = state.validationErrors.filter((e) => e.severity === "error").length
  const warningCount = state.validationErrors.filter((e) => e.severity === "warning").length

  const getIcon = (severity: "error" | "warning") => {
    return severity === "error" ? (
      <AlertCircle className="h-4 w-4 text-red-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-600" />
          <CardTitle className="text-lg">Validation Summary</CardTitle>
        </div>
        <CardDescription>Real-time data quality assessment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="flex items-center gap-2">
          {errorCount === 0 && warningCount === 0 ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700">All validations passed</span>
            </>
          ) : (
            <div className="flex gap-2">
              {errorCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {errorCount} Errors
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                  {warningCount} Warnings
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Error List */}
        {state.validationErrors.length > 0 && (
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {state.validationErrors.map((error) => (
                <div key={error.id} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                  {getIcon(error.severity)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{error.type}</p>
                    <p className="text-xs text-muted-foreground">{error.message}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {error.entity}
                      </Badge>
                      {error.field && (
                        <Badge variant="outline" className="text-xs">
                          {error.field}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Validation Categories */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Validation Categories</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Data Integrity</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Cross-References</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Business Rules</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>AI Validation</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
