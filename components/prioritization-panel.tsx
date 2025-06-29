"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Diamond, Settings, LayoutTemplate, Percent } from "lucide-react"
import { useData } from "@/contexts/data-context"

export default function AllocationStrategyPanel() {
  const { state, dispatch } = useData()

  const updatePriorityWeight = (id: string, weight: number) => {
    dispatch({
      type: "UPDATE_PRIORITY",
      payload: { id, priority: { weight: weight / 100 } },
    })
  }

  const strategyProfiles = [
    {
      name: "Task Completion Focus",
      description: "Emphasize completing the maximum number of assignments",
      weights: {
        "1": 0.1,
        "2": 0.4,
        "3": 0.2,
        "4": 0.2,
        "5": 0.1,
      },
    },
    {
      name: "Workload Equity",
      description: "Ensure balanced task distribution across team members",
      weights: {
        "1": 0.2,
        "2": 0.2,
        "3": 0.4,
        "4": 0.1,
        "5": 0.1,
      },
    },
    {
      name: "High Priority Emphasis",
      description: "Focus on critical assignments above all else",
      weights: {
        "1": 0.5,
        "2": 0.2,
        "3": 0.1,
        "4": 0.1,
        "5": 0.1,
      },
    },
    {
      name: "Skill Alignment",
      description: "Optimize for matching tasks with specialist capabilities",
      weights: {
        "1": 0.1,
        "2": 0.2,
        "3": 0.2,
        "4": 0.4,
        "5": 0.1,
      },
    },
  ]

  const applyStrategy = (strategy: (typeof strategyProfiles)[0]) => {
    Object.entries(strategy.weights).forEach(([id, weight]) => {
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
      <Card className="border-2 border-emerald-100 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Diamond className="h-6 w-6 text-emerald-600" />
            <CardTitle className="text-xl">Allocation Strategy Settings</CardTitle>
          </div>
          <CardDescription className="pt-1">
            Adjust the importance of different factors in the task allocation process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="weights" className="space-y-5">
            <TabsList className="grid w-full grid-cols-2 bg-emerald-50 p-1">
              <TabsTrigger 
                value="weights" 
                className="flex items-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
              >
                <Settings className="h-4 w-4" />
                Custom Configuration
              </TabsTrigger>
              <TabsTrigger 
                value="presets" 
                className="flex items-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
              >
                <LayoutTemplate className="h-4 w-4" />
                Strategy Templates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weights" className="space-y-6 pt-3">
              {/* Weight Status */}
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div>
                  <h4 className="font-semibold text-emerald-800">Total Allocation Weight</h4>
                  <p className="text-sm text-emerald-600">
                    Configure weights to total 100% for optimal resource distribution
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-700">
                    {Math.round(totalWeight * 100)}%
                  </div>
                  <Badge 
                    variant={isBalanced ? "default" : "destructive"} 
                    className={isBalanced ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                  >
                    {isBalanced ? "Optimal" : "Requires Adjustment"}
                  </Badge>
                </div>
              </div>

              {/* Weight Sliders */}
              <div className="space-y-7 pt-2">
                {state.priorities.map((priority) => (
                  <div key={priority.id} className="space-y-4 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-semibold text-base text-slate-800">
                          {priority.name}
                        </Label>
                        <p className="text-sm text-slate-500 mt-1">
                          {priority.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-emerald-700">
                          {Math.round(priority.weight * 100)}%
                        </span>
                      </div>
                    </div>
                    <Slider
                      value={[priority.weight * 100]}
                      onValueChange={([value]) => updatePriorityWeight(priority.id, value)}
                      max={100}
                      step={1}
                      className="w-full [&>div>span]:bg-emerald-400"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Minimal Priority</span>
                      <span>Maximum Priority</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="presets" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {strategyProfiles.map((strategy, index) => (
                  <Card 
                    key={index} 
                    className="cursor-pointer transition-all hover:border-emerald-300 hover:scale-[1.02] border-2"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Percent className="h-5 w-5 text-emerald-600" />
                        {strategy.name}
                      </CardTitle>
                      <CardDescription className="text-sm pl-7">
                        {strategy.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        {Object.entries(strategy.weights).map(([id, weight]) => {
                          const priority = state.priorities.find((p) => p.id === id)
                          return priority ? (
                            <div key={id} className="flex justify-between text-sm">
                              <span className="text-slate-700">{priority.name}</span>
                              <span className="font-medium text-emerald-700">
                                {Math.round(weight * 100)}%
                              </span>
                            </div>
                          ) : null
                        })}
                      </div>
                      <Button 
                        onClick={() => applyStrategy(strategy)} 
                        className="w-full bg-emerald-500 hover:bg-emerald-600"
                      >
                        Activate Strategy
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
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <BarChart className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-xl">Allocation Factor Distribution</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {state.priorities.map((priority) => (
              <div key={priority.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-800">{priority.name}</span>
                  <span className="text-blue-700 font-bold">{Math.round(priority.weight * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-700 h-3 rounded-full transition-all duration-300"
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