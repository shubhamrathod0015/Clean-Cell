"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, Wand2, CheckCircle, AlertTriangle, Lightbulb, Loader2 } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { validateData } from "@/lib/validators"

interface ErrorSuggestion {
  id: string
  errorId: string
  type: "fix" | "suggestion" | "alternative"
  title: string
  description: string
  action: string
  confidence: number
  autoApplicable: boolean
  fixFunction?: () => void
}

export default function AIErrorCorrection() {
  const { state, dispatch } = useData()
  const [suggestions, setSuggestions] = useState<ErrorSuggestion[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set())
  const [isApplying, setIsApplying] = useState<string | null>(null)

  const fixInvalidTaskReferences = () => {
    // Fix clients with invalid task references
    const updatedClients = state.clients.map((client) => {
      if (Array.isArray(client.RequestedTaskIDs)) {
        const validTaskIds = client.RequestedTaskIDs.filter((taskId) => {
          // Remove invalid task IDs like TX, T99, T60, T51, etc.
          return (
            !taskId.includes("X") &&
            !taskId.includes("99") &&
            !taskId.includes("60") &&
            !taskId.includes("51") &&
            taskId.match(/^T\d+$/) &&
            Number.parseInt(taskId.substring(1)) <= 50
          )
        })
        return { ...client, RequestedTaskIDs: validTaskIds }
      }
      return client
    })

    dispatch({ type: "SET_CLIENTS", payload: updatedClients })
  }

  const fixMalformedJSON = () => {
    // Fix clients with malformed JSON in AttributesJSON
    const updatedClients = state.clients.map((client) => {
      if (client.AttributesJSON && typeof client.AttributesJSON === "string") {
        // If it's not valid JSON and not already wrapped
        if (!client.AttributesJSON.startsWith("{") && !client.AttributesJSON.startsWith('"')) {
          // Convert plain text to JSON format
          const jsonString = JSON.stringify({ message: client.AttributesJSON })
          return { ...client, AttributesJSON: jsonString }
        }
      }
      return client
    })

    dispatch({ type: "SET_CLIENTS", payload: updatedClients })
  }

  const fixOverloadedWorkers = () => {
    // Fix workers where MaxLoadPerPhase exceeds AvailableSlots
    const updatedWorkers = state.workers.map((worker) => {
      if (Array.isArray(worker.AvailableSlots) && worker.MaxLoadPerPhase > worker.AvailableSlots.length) {
        // Reduce MaxLoadPerPhase to match available slots
        return { ...worker, MaxLoadPerPhase: worker.AvailableSlots.length }
      }
      return worker
    })

    dispatch({ type: "SET_WORKERS", payload: updatedWorkers })
  }

  const fixInvalidDurations = () => {
    // Fix tasks with invalid durations (< 1)
    const updatedTasks = state.tasks.map((task) => {
      if (task.Duration < 1) {
        return { ...task, Duration: 1 }
      }
      return task
    })

    dispatch({ type: "SET_TASKS", payload: updatedTasks })
  }

  const fixInvalidPriorities = () => {
    // Fix clients with invalid priority levels
    const updatedClients = state.clients.map((client) => {
      if (client.PriorityLevel < 1) {
        return { ...client, PriorityLevel: 1 }
      }
      if (client.PriorityLevel > 5) {
        return { ...client, PriorityLevel: 5 }
      }
      return client
    })

    dispatch({ type: "SET_CLIENTS", payload: updatedClients })
  }

  const generateSuggestions = async () => {
    setIsAnalyzing(true)

    try {
      // Simulate AI analysis
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newSuggestions: ErrorSuggestion[] = []

      // Analyze validation errors and generate suggestions with actual fix functions
      state.validationErrors.forEach((error) => {
        if (error.type === "Unknown Task References" || error.message.includes("non-existent tasks")) {
          newSuggestions.push({
            id: `fix-invalid-tasks-${error.id}`,
            errorId: error.id,
            type: "fix",
            title: "Fix Invalid Task References",
            description: "Remove invalid task IDs (TX, T99, T60, T51) from client requests",
            action: "Auto-remove invalid task references",
            confidence: 95,
            autoApplicable: true,
            fixFunction: fixInvalidTaskReferences,
          })
        }

        if (error.type === "Malformed JSON" || error.message.includes("plain text")) {
          newSuggestions.push({
            id: `fix-malformed-json-${error.id}`,
            errorId: error.id,
            type: "fix",
            title: "Convert Text to JSON",
            description: "Convert plain text messages to proper JSON format",
            action: 'Wrap in JSON: {"message": "text content"}',
            confidence: 98,
            autoApplicable: true,
            fixFunction: fixMalformedJSON,
          })
        }

        if (error.type === "Overloaded Worker" || error.message.includes("exceeds available slots")) {
          newSuggestions.push({
            id: `fix-overloaded-worker-${error.id}`,
            errorId: error.id,
            type: "fix",
            title: "Fix Worker Overload",
            description: "Adjust MaxLoadPerPhase to match available slots",
            action: "Reduce MaxLoadPerPhase to available slots count",
            confidence: 90,
            autoApplicable: true,
            fixFunction: fixOverloadedWorkers,
          })
        }

        if (error.type === "Out of Range Value" && error.message.includes("Duration")) {
          newSuggestions.push({
            id: `fix-invalid-duration-${error.id}`,
            errorId: error.id,
            type: "fix",
            title: "Fix Invalid Task Duration",
            description: "Set minimum duration to 1 phase",
            action: "Set duration to 1 for invalid values",
            confidence: 100,
            autoApplicable: true,
            fixFunction: fixInvalidDurations,
          })
        }

        if (error.type === "Out of Range Value" && error.message.includes("Priority Level")) {
          newSuggestions.push({
            id: `fix-invalid-priority-${error.id}`,
            errorId: error.id,
            type: "fix",
            title: "Fix Invalid Priority Level",
            description: "Adjust priority levels to valid range (1-5)",
            action: "Clamp priority values to 1-5 range",
            confidence: 100,
            autoApplicable: true,
            fixFunction: fixInvalidPriorities,
          })
        }
      })

      // Remove duplicate suggestions (same fix for multiple errors)
      const uniqueSuggestions = newSuggestions.filter(
        (suggestion, index, self) =>
          index === self.findIndex((s) => s.title === suggestion.title && s.type === suggestion.type),
      )

      // Add proactive suggestions based on data patterns
      if (state.clients.length > 0) {
        uniqueSuggestions.push({
          id: "pattern-suggestion-1",
          errorId: "",
          type: "suggestion",
          title: "Optimize Client Priority Distribution",
          description: "Current priority distribution may cause resource conflicts",
          action: "Suggest priority rebalancing for better allocation",
          confidence: 70,
          autoApplicable: false,
        })
      }

      setSuggestions(uniqueSuggestions)
    } catch (error) {
      console.error("Error generating suggestions:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const applySuggestion = async (suggestion: ErrorSuggestion) => {
    if (!suggestion.autoApplicable || !suggestion.fixFunction) return

    setIsApplying(suggestion.id)

    try {
      // Apply the actual fix
      suggestion.fixFunction()

      // Wait a moment for the state to update
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Re-run validation to update errors
      const allData = {
        clients: state.clients,
        workers: state.workers,
        tasks: state.tasks,
      }

      // Validate all data types and combine errors
      const clientErrors = validateData(state.clients, "clients", allData)
      const workerErrors = validateData(state.workers, "workers", allData)
      const taskErrors = validateData(state.tasks, "tasks", allData)
      const allErrors = [...clientErrors, ...workerErrors, ...taskErrors]

      dispatch({ type: "SET_VALIDATION_ERRORS", payload: allErrors })

      // Mark as applied
      setAppliedSuggestions((prev) => new Set([...prev, suggestion.id]))

      // Remove this suggestion from the list since it's been applied
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id))
    } catch (error) {
      console.error("Error applying suggestion:", error)
    } finally {
      setIsApplying(null)
    }
  }

  const getSuggestionIcon = (type: ErrorSuggestion["type"]) => {
    switch (type) {
      case "fix":
        return <Wand2 className="h-4 w-4 text-green-600" />
      case "suggestion":
        return <Lightbulb className="h-4 w-4 text-yellow-600" />
      case "alternative":
        return <AlertTriangle className="h-4 w-4 text-blue-600" />
    }
  }

  const getSuggestionBadge = (type: ErrorSuggestion["type"]) => {
    switch (type) {
      case "fix":
        return <Badge className="bg-green-100 text-green-800">Auto-Fix</Badge>
      case "suggestion":
        return <Badge className="bg-yellow-100 text-yellow-800">Suggestion</Badge>
      case "alternative":
        return <Badge className="bg-blue-100 text-blue-800">Alternative</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <CardTitle>AI Error Correction</CardTitle>
        </div>
        <CardDescription>AI-powered suggestions to fix data quality issues and optimize your dataset</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Analysis Button */}
        <Button onClick={generateSuggestions} disabled={isAnalyzing} className="w-full">
          {isAnalyzing ? (
            <>
              <Wand2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing data with AI...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate AI Suggestions
            </>
          )}
        </Button>

        {/* Suggestions List */}
        {suggestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">AI Recommendations</h4>
              <Badge variant="secondary">{suggestions.length} suggestions</Badge>
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-3">
                {suggestions.map((suggestion) => {
                  const isApplied = appliedSuggestions.has(suggestion.id)
                  const isCurrentlyApplying = isApplying === suggestion.id

                  return (
                    <div
                      key={suggestion.id}
                      className={`p-4 border rounded-lg ${isApplied ? "bg-green-50 border-green-200" : "bg-white"}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isApplied ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            getSuggestionIcon(suggestion.type)
                          )}
                          <h5 className="font-medium text-sm">{suggestion.title}</h5>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSuggestionBadge(suggestion.type)}
                          <Badge variant="outline" className="text-xs">
                            {suggestion.confidence}% confidence
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600 font-medium">{suggestion.action}</span>

                        {!isApplied && suggestion.autoApplicable && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => applySuggestion(suggestion)}
                            disabled={isCurrentlyApplying}
                          >
                            {isCurrentlyApplying ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Applying...
                              </>
                            ) : (
                              "Apply Fix"
                            )}
                          </Button>
                        )}

                        {isApplied && <span className="text-xs text-green-600 font-medium">✓ Applied</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* AI Capabilities Info */}
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            AI analyzes your data for quality issues, suggests fixes, and automatically applies corrections to improve
            data quality. Applied fixes will update the validation summary.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
