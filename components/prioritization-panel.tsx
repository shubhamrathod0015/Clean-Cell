"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Target, Sliders, TrendingUp } from "lucide-react"
import { useData } from "@/contexts/data-context"

export default function PrioritizationPanel() {
  const { state, dispatch } = useData()

  const updatePriorityWeight = (id: string, weight: number) => {
    dispatch({
      type: "UPDATE_PRIORITY",
      payload: { id, priority: { weight: weight / 100 } },
    })
  }

  const presetProfiles = [
    {
      name: "Maximize Fulfillment",
      description: "Focus on completing as many requested tasks as possible",
      weights: {
        "1": 0.1, // Priority Level
        "2": 0.4, // Task Fulfillment
        "3": 0.2, // Worker Fairness
        "4": 0.2, // Skill Matching
        "5": 0.1, // Phase Efficiency
      },
    },
    {
      name: "Fair Distribution",
      description: "Ensure equal workload distribution among workers",
      weights: {
        "1": 0.2,
        "2": 0.2,
        "3": 0.4,
        "4": 0.1,
        "5": 0.1,
      },
    },
    {
      name: "Priority First",
      description: "Prioritize high-priority clients above all else",
      weights: {
        "1": 0.5,
        "2": 0.2,
        "3": 0.1,
        "4": 0.1,
        "5": 0.1,
      },
    },
    {
      name: "Skill Optimization",
      description: "Optimize for best skill-task matching",
      weights: {
        "1": 0.1,
        "2": 0.2,
        "3": 0.2,
        "4": 0.4,
        "5": 0.1,
      },
    },
  ]

  const applyPreset = (preset: (typeof presetProfiles)[0]) => {
    Object.entries(preset.weights).forEach(([id, weight]) => {
      dispatch({
        type: "UPDATE_PRIORITY",
        payload: { id, priority: { weight } },
      })
    })
  }

  const totalWeight = state.priorities.reduce((sum, p) => sum + p.weight, 0)
  const isBalanced = Math.abs(totalWeight - 1) < 0.01

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" />
            <CardTitle>Prioritization & Weights</CardTitle>
          </div>
          <CardDescription>Configure how the system should balance different allocation criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="weights" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="weights" className="flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                Weight Configuration
              </TabsTrigger>
              <TabsTrigger value="presets" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Preset Profiles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weights" className="space-y-6">
              {/* Weight Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium">Total Weight</h4>
                  <p className="text-sm text-muted-foreground">Weights should sum to 100% for optimal allocation</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{Math.round(totalWeight * 100)}%</div>
                  <Badge variant={isBalanced ? "default" : "destructive"}>
                    {isBalanced ? "Balanced" : "Unbalanced"}
                  </Badge>
                </div>
              </div>

              {/* Weight Sliders */}
              <div className="space-y-6">
                {state.priorities.map((priority) => (
                  <div key={priority.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">{priority.name}</Label>
                        <p className="text-sm text-muted-foreground">{priority.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{Math.round(priority.weight * 100)}%</span>
                      </div>
                    </div>
                    <Slider
                      value={[priority.weight * 100]}
                      onValueChange={([value]) => updatePriorityWeight(priority.id, value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="presets" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {presetProfiles.map((preset, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{preset.name}</CardTitle>
                      <CardDescription className="text-sm">{preset.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {Object.entries(preset.weights).map(([id, weight]) => {
                          const priority = state.priorities.find((p) => p.id === id)
                          return priority ? (
                            <div key={id} className="flex justify-between text-sm">
                              <span>{priority.name}</span>
                              <span className="font-medium">{Math.round(weight * 100)}%</span>
                            </div>
                          ) : null
                        })}
                      </div>
                      <Button onClick={() => applyPreset(preset)} className="w-full" variant="outline">
                        Apply Profile
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Priority Visualization */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <CardTitle>Priority Distribution</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state.priorities.map((priority) => (
              <div key={priority.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{priority.name}</span>
                  <span>{Math.round(priority.weight * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${priority.weight * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
