"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Sparkles, Loader2 } from "lucide-react"
import { useData } from "@/contexts/data-context"

export default function NaturalLanguageSearch() {
  const { state, dispatch } = useData()
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)

    try {
      // Simulate AI-powered natural language search
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simple keyword-based search for demo with null safety
      const results = []
      const searchTerm = query.toLowerCase()

      // Search clients with null safety
      const clientResults = state.clients
        .filter((client) => {
          if (!client) return false

          const nameMatch = client.ClientName?.toLowerCase()?.includes(searchTerm) || false
          const groupMatch = client.GroupTag?.toLowerCase()?.includes(searchTerm) || false
          const priorityMatch = client.PriorityLevel?.toString()?.includes(searchTerm) || false

          // Handle priority-related queries
          if (
            searchTerm.includes("high priority") ||
            searchTerm.includes("priority 5") ||
            searchTerm.includes("priority 4")
          ) {
            return client.PriorityLevel >= 4
          }
          if (
            searchTerm.includes("low priority") ||
            searchTerm.includes("priority 1") ||
            searchTerm.includes("priority 2")
          ) {
            return client.PriorityLevel <= 2
          }

          return nameMatch || groupMatch || priorityMatch
        })
        .map((client) => ({ ...client, type: "client" }))

      // Search workers with null safety
      const workerResults = state.workers
        .filter((worker) => {
          if (!worker) return false

          const nameMatch = worker.WorkerName?.toLowerCase()?.includes(searchTerm) || false
          const groupMatch = worker.WorkerGroup?.toLowerCase()?.includes(searchTerm) || false

          // Handle skills array safely
          const skillsMatch = Array.isArray(worker.Skills)
            ? worker.Skills.some((skill) => skill?.toLowerCase()?.includes(searchTerm))
            : false

          // Handle specific skill queries
          if (searchTerm.includes("javascript") || searchTerm.includes("js")) {
            return (
              Array.isArray(worker.Skills) &&
              worker.Skills.some(
                (skill) => skill?.toLowerCase()?.includes("javascript") || skill?.toLowerCase()?.includes("js"),
              )
            )
          }
          if (searchTerm.includes("python")) {
            return (
              Array.isArray(worker.Skills) && worker.Skills.some((skill) => skill?.toLowerCase()?.includes("python"))
            )
          }
          if (searchTerm.includes("react")) {
            return (
              Array.isArray(worker.Skills) && worker.Skills.some((skill) => skill?.toLowerCase()?.includes("react"))
            )
          }

          return nameMatch || groupMatch || skillsMatch
        })
        .map((worker) => ({ ...worker, type: "worker" }))

      // Search tasks with null safety
      const taskResults = state.tasks
        .filter((task) => {
          if (!task) return false

          const nameMatch = task.TaskName?.toLowerCase()?.includes(searchTerm) || false
          const categoryMatch = task.Category?.toLowerCase()?.includes(searchTerm) || false

          // Handle required skills array safely
          const skillsMatch = Array.isArray(task.RequiredSkills)
            ? task.RequiredSkills.some((skill) => skill?.toLowerCase()?.includes(searchTerm))
            : false

          // Handle duration queries
          if (searchTerm.includes("more than") && searchTerm.includes("phase")) {
            const durationMatch = searchTerm.match(/more than (\d+)/)
            if (durationMatch) {
              const threshold = Number.parseInt(durationMatch[1])
              return task.Duration > threshold
            }
          }

          if (searchTerm.includes("duration") && searchTerm.includes("2")) {
            return task.Duration > 2
          }

          return nameMatch || categoryMatch || skillsMatch
        })
        .map((task) => ({ ...task, type: "task" }))

      results.push(...clientResults, ...workerResults, ...taskResults)

      dispatch({ type: "SET_SEARCH_RESULTS", payload: results })
    } catch (error) {
      console.error("Search error:", error)
      // Set empty results on error
      dispatch({ type: "SET_SEARCH_RESULTS", payload: [] })
    } finally {
      setIsSearching(false)
    }
  }

  const exampleQueries = [
    "High priority clients",
    "Workers with JavaScript skills",
    "Workers with Python skills",
    "Tasks with duration more than 2",
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <CardTitle className="text-lg">AI Search</CardTitle>
        </div>
        <CardDescription>Search your data using natural language</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <Input
            placeholder="e.g., 'All tasks with duration > 2 phases'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {/* Example Queries */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Try these examples:</p>
          <div className="flex flex-wrap gap-1">
            {exampleQueries.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-6 bg-transparent"
                onClick={() => setQuery(example)}
              >
                {example}
              </Button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {state.searchResults.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">Results</h4>
              <Badge variant="secondary" className="text-xs">
                {state.searchResults.length} found
              </Badge>
            </div>
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {state.searchResults.map((result, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded bg-gray-50 dark:bg-gray-800">
                    <Badge variant="outline" className="text-xs">
                      {result.type}
                    </Badge>
                    <span className="text-sm">
                      {result.type === "client" && result.ClientName}
                      {result.type === "worker" && result.WorkerName}
                      {result.type === "task" && result.TaskName}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
