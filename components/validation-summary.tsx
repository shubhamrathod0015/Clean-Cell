"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, CheckCircle, AlertTriangle, Gauge, ListChecks } from "lucide-react"
import { useData } from "@/contexts/data-context"

export default function ValidationSummary() {
  const { state } = useData()

  const errorCount = state.validationErrors.filter((e) => e.severity === "error").length
  const warningCount = state.validationErrors.filter((e) => e.severity === "warning").length

  const getIcon = (severity: "error" | "warning") => {
    return severity === "error" ? (
      <AlertCircle className="h-5 w-5 text-red-500" />
    ) : (
      <AlertTriangle className="h-5 w-5 text-amber-500" />
    )
  }

  const validationCategories = [
    { name: "Data Integrity", color: "bg-sky-500" },
    { name: "Cross-References", color: "bg-emerald-500" },
    { name: "Business Rules", color: "bg-amber-500" },
    { name: "AI Validation", color: "bg-violet-500" },
  ]

  return (
    <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <ListChecks className="h-6 w-6 text-indigo-700" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-gray-800">Data Quality Report</CardTitle>
            <CardDescription className="text-indigo-600 font-medium">
              Real-time validation insights
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 space-y-5">
        {/* Status Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border ${errorCount > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className={`h-4 w-4 ${errorCount > 0 ? 'text-red-600' : 'text-emerald-600'}`} />
              <span className="text-sm font-medium">Data Errors</span>
            </div>
            <div className={`text-2xl font-bold ${errorCount > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
              {errorCount}
            </div>
          </div>
          
          <div className={`p-4 rounded-xl border ${warningCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className={`h-4 w-4 ${warningCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
              <span className="text-sm font-medium">Quality Warnings</span>
            </div>
            <div className={`text-2xl font-bold ${warningCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {warningCount}
            </div>
          </div>
        </div>

        {/* Validation Status */}
        {errorCount === 0 && warningCount === 0 ? (
          <div className="py-4 px-5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col items-center justify-center">
            <CheckCircle className="h-8 w-8 text-emerald-600 mb-2" />
            <span className="text-lg font-semibold text-emerald-800">All checks passed</span>
            <span className="text-sm text-emerald-700 mt-1">Your data meets quality standards</span>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-indigo-600" />
              Issue Details
            </h3>
            <ScrollArea className="h-52 rounded-lg border">
              <div className="space-y-3 p-3">
                {state.validationErrors.map((error) => (
                  <div 
                    key={error.id} 
                    className={`p-4 rounded-lg border-l-4 ${
                      error.severity === "error" 
                        ? 'border-l-red-500 bg-red-50' 
                        : 'border-l-amber-500 bg-amber-50'
                    }`}
                  >
                    <div className="flex gap-3">
                      {getIcon(error.severity)}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium text-gray-800">{error.type}</p>
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="text-xs bg-indigo-100 text-indigo-800">
                              {error.entity}
                            </Badge>
                            {error.field && (
                              <Badge variant="secondary" className="text-xs bg-indigo-100 text-indigo-800">
                                {error.field}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{error.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Validation Categories */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700">Validation Types</h3>
          <div className="flex flex-wrap gap-3">
            {validationCategories.map((category, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg"
              >
                <span className={`w-3 h-3 rounded-full ${category.color}`}></span>
                <span className="text-sm text-gray-700">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}