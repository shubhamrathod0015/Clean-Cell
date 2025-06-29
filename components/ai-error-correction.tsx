"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Sparkles, Wand2, CheckCircle, Lightbulb, Loader2, Zap, RefreshCw, AlertTriangle } from "lucide-react"
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
    const updatedClients = state.clients.map(client => {
      if (Array.isArray(client.RequestedTaskIDs)) {
        const validTaskIds = client.RequestedTaskIDs.filter(taskId => {
          return taskId.match(/^T\d+$/) && 
            !isNaN(Number(taskId.substring(1))) && 
            Number(taskId.substring(1)) <= 50
        })
        return { ...client, RequestedTaskIDs: validTaskIds }
      }
      return client
    })
    dispatch({ type: "SET_CLIENTS", payload: updatedClients })
  }

  const fixMalformedJSON = () => {
    const updatedClients = state.clients.map(client => {
      if (client.AttributesJSON && typeof client.AttributesJSON === "string") {
        if (!client.AttributesJSON.startsWith("{") && !client.AttributesJSON.startsWith('"')) {
          return { ...client, AttributesJSON: JSON.stringify({ value: client.AttributesJSON }) }
        }
      }
      return client
    })
    dispatch({ type: "SET_CLIENTS", payload: updatedClients })
  }

  const fixOverloadedWorkers = () => {
    const updatedWorkers = state.workers.map(worker => {
      if (Array.isArray(worker.AvailableSlots) && worker.MaxLoadPerPhase > worker.AvailableSlots.length) {
        return { ...worker, MaxLoadPerPhase: worker.AvailableSlots.length }
      }
      return worker
    })
    dispatch({ type: "SET_WORKERS", payload: updatedWorkers })
  }

  const fixInvalidDurations = () => {
    const updatedTasks = state.tasks.map(task => {
      if (task.Duration < 1) return { ...task, Duration: 1 }
      return task
    })
    dispatch({ type: "SET_TASKS", payload: updatedTasks })
  }

  const fixInvalidPriorities = () => {
    const updatedClients = state.clients.map(client => {
      if (client.PriorityLevel < 1) return { ...client, PriorityLevel: 1 }
      if (client.PriorityLevel > 5) return { ...client, PriorityLevel: 5 }
      return client
    })
    dispatch({ type: "SET_CLIENTS", payload: updatedClients })
  }

  const generateSuggestions = async () => {
    setIsAnalyzing(true)
    setSuggestions([])
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newSuggestions: ErrorSuggestion[] = []
      const seenSuggestions = new Set<string>()

      state.validationErrors.forEach(error => {
        let suggestion: ErrorSuggestion | null = null
        
        if (error.type === "Unknown Task References") {
          suggestion = {
            id: `fix-tasks-${error.id}`,
            errorId: error.id,
            type: "fix",
            title: "Remove Invalid Task References",
            description: "Clean up task IDs that don't exist in the system",
            action: "Auto-remove invalid references",
            confidence: 97,
            autoApplicable: true,
            fixFunction: fixInvalidTaskReferences
          }
        }
        
        if (error.type === "Malformed JSON") {
          suggestion = {
            id: `fix-json-${error.id}`,
            errorId: error.id,
            type: "fix",
            title: "Fix JSON Formatting",
            description: "Convert plain text attributes to valid JSON format",
            action: 'Convert to JSON format',
            confidence: 99,
            autoApplicable: true,
            fixFunction: fixMalformedJSON
          }
        }
        
        if (error.type === "Overloaded Worker") {
          suggestion = {
            id: `fix-overload-${error.id}`,
            errorId: error.id,
            type: "fix",
            title: "Adjust Worker Capacity",
            description: "Worker capacity exceeds available time slots",
            action: "Set max load to available slots",
            confidence: 92,
            autoApplicable: true,
            fixFunction: fixOverloadedWorkers
          }
        }
        
        if (error.type === "Out of Range Value" && error.message.includes("Duration")) {
          suggestion = {
            id: `fix-duration-${error.id}`,
            errorId: error.id,
            type: "fix",
            title: "Fix Task Duration",
            description: "Tasks must have minimum duration of 1 phase",
            action: "Set duration to minimum value",
            confidence: 100,
            autoApplicable: true,
            fixFunction: fixInvalidDurations
          }
        }
        
        if (error.type === "Out of Range Value" && error.message.includes("Priority Level")) {
          suggestion = {
            id: `fix-priority-${error.id}`,
            errorId: error.id,
            type: "fix",
            title: "Adjust Priority Levels",
            description: "Priority must be between 1-5",
            action: "Clamp values to valid range",
            confidence: 100,
            autoApplicable: true,
            fixFunction: fixInvalidPriorities
          }
        }
        
        if (suggestion && !seenSuggestions.has(suggestion.title)) {
          newSuggestions.push(suggestion)
          seenSuggestions.add(suggestion.title)
        }
      })

      // Add proactive suggestions
      if (state.clients.length > 0 && !seenSuggestions.has("priority-distribution")) {
        newSuggestions.push({
          id: "suggestion-priority",
          errorId: "",
          type: "suggestion",
          title: "Balance Priority Distribution",
          description: "Current distribution may cause resource contention",
          action: "Suggest priority rebalancing",
          confidence: 75,
          autoApplicable: false,
        })
      }
      
      if (state.workers.length > 0 && !seenSuggestions.has("skill-coverage")) {
        newSuggestions.push({
          id: "suggestion-skills",
          errorId: "",
          type: "suggestion",
          title: "Optimize Skill Coverage",
          description: "Some skills are under-represented in your workforce",
          action: "Analyze skill gaps",
          confidence: 68,
          autoApplicable: false,
        })
      }

      setSuggestions(newSuggestions)
    } catch (error) {
      console.error("AI analysis failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const applySuggestion = async (suggestion: ErrorSuggestion) => {
    if (!suggestion.autoApplicable || !suggestion.fixFunction) return

    setIsApplying(suggestion.id)
    
    try {
      suggestion.fixFunction()
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Re-run validation
      const allData = { clients: state.clients, workers: state.workers, tasks: state.tasks }
      const clientErrors = validateData(state.clients, "clients", allData)
      const workerErrors = validateData(state.workers, "workers", allData)
      const taskErrors = validateData(state.tasks, "tasks", allData)
      dispatch({ type: "SET_VALIDATION_ERRORS", payload: [...clientErrors, ...workerErrors, ...taskErrors] })

      setAppliedSuggestions(prev => new Set([...prev, suggestion.id]))
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
    } catch (error) {
      console.error("Failed to apply fix:", error)
    } finally {
      setIsApplying(null)
    }
  }

  const getSuggestionBadge = (type: ErrorSuggestion["type"]) => {
    switch (type) {
      case "fix": return <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/30">Auto-Fix</Badge>
      case "suggestion": return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30">Suggestion</Badge>
      case "alternative": return <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30">Alternative</Badge>
    }
  }

  const getSuggestionIcon = (type: ErrorSuggestion["type"]) => {
    switch (type) {
      case "fix": return <Zap className="h-4 w-4 text-teal-600" />
      case "suggestion": return <Lightbulb className="h-4 w-4 text-amber-600" />
      case "alternative": return <AlertTriangle className="h-4 w-4 text-indigo-600" />
    }
  }

  return (
    <Card className="border border-blue-200 dark:border-blue-900/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-teal-500 p-2 rounded-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-blue-800 dark:text-blue-200">AI Data Assistant</CardTitle>
            <CardDescription>Intelligent fixes and optimization suggestions</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5">
        <Button 
          onClick={generateSuggestions} 
          disabled={isAnalyzing}
          className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Scanning data...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Analyze with AI
            </>
          )}
        </Button>

        {suggestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">Recommendations</h3>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {suggestions.length} suggestions
              </Badge>
            </div>
            
            <ScrollArea className="h-[300px]">
              <div className="space-y-3 pr-3">
                {suggestions.map(suggestion => {
                  const isApplied = appliedSuggestions.has(suggestion.id)
                  const isApplyingNow = isApplying === suggestion.id
                  
                  return (
                    <div 
                      key={suggestion.id}
                      className={`p-4 rounded-xl border ${
                        isApplied 
                          ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50" 
                          : "bg-blue-50/50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {isApplied 
                              ? <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" /> 
                              : getSuggestionIcon(suggestion.type)
                            }
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900 dark:text-blue-100">{suggestion.title}</h4>
                            <p className="text-sm text-muted-foreground dark:text-blue-300">{suggestion.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getSuggestionBadge(suggestion.type)}
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-white dark:bg-gray-800"
                          >
                            {suggestion.confidence}% confidence
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                          {suggestion.action}
                        </span>
                        
                        {!isApplied && suggestion.autoApplicable && (
                          <Button
                            size="sm"
                            variant={suggestion.type === "fix" ? "default" : "secondary"}
                            className="bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:from-blue-600 hover:to-teal-600"
                            onClick={() => applySuggestion(suggestion)}
                            disabled={isApplyingNow}
                          >
                            {isApplyingNow ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Applying...
                              </>
                            ) : (
                              "Apply Fix"
                            )}
                          </Button>
                        )}
                        
                        {isApplied && (
                          <span className="text-xs font-medium flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-4 w-4" /> Applied
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        <Alert className="bg-blue-50/50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <AlertTitle className="text-blue-800 dark:text-blue-200">Smart Data Correction</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                AI analyzes your data structure, detects anomalies, and provides one-click fixes 
                to ensure data quality and consistency.
              </AlertDescription>
            </div>
          </div>
        </Alert>
      </CardContent>
    </Card>
  )
}
