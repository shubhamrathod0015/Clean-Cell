"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Settings, Trash2, Sparkles, Wand2, Bot, List } from "lucide-react"
import { useData } from "@/contexts/data-context"
import type { Rule } from "@/contexts/data-context"

export default function RuleBuilder() {
  // All state and core logic remains exactly the same
  const { state, dispatch } = useData()
  const [newRule, setNewRule] = useState<Partial<Rule>>({
    type: "coRun",
    name: "",
    description: "",
    parameters: {},
    active: true,
  })
  const [naturalLanguageRule, setNaturalLanguageRule] = useState("")
  const [isProcessingNL, setIsProcessingNL] = useState(false)

  const ruleTypes = [
    { value: "coRun", label: "Co-run Tasks", description: "Tasks that must run together" },
    { value: "slotRestriction", label: "Slot Restriction", description: "Limit common slots for groups" },
    { value: "loadLimit", label: "Load Limit", description: "Maximum slots per phase for workers" },
    { value: "phaseWindow", label: "Phase Window", description: "Allowed phases for specific tasks" },
    { value: "patternMatch", label: "Pattern Match", description: "Regex-based rule matching" },
    { value: "precedence", label: "Precedence Override", description: "Rule priority ordering" },
  ]

  // Core logic functions remain completely unchanged
  const addRule = () => {
    if (!newRule.name || !newRule.type) return

    const rule: Rule = {
      id: Date.now().toString(),
      type: newRule.type as Rule["type"],
      name: newRule.name,
      description: newRule.description || "",
      parameters: newRule.parameters || {},
      active: newRule.active ?? true,
    }

    dispatch({ type: "ADD_RULE", payload: rule })
    setNewRule({
      type: "coRun",
      name: "",
      description: "",
      parameters: {},
      active: true,
    })
  }

  const deleteRule = (id: string) => {
    dispatch({ type: "DELETE_RULE", payload: id })
  }

  const toggleRule = (id: string, active: boolean) => {
    dispatch({ type: "UPDATE_RULE", payload: { id, rule: { active } } })
  }

  const processNaturalLanguageRule = async () => {
    // Unchanged core logic
    if (!naturalLanguageRule.trim()) return

    setIsProcessingNL(true)

    try {
      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simple rule extraction for demo
      let ruleType: Rule["type"] = "coRun"
      let ruleName = "AI Generated Rule"
      const ruleDescription = naturalLanguageRule
      let parameters = {}

      if (
        naturalLanguageRule.toLowerCase().includes("together") ||
        naturalLanguageRule.toLowerCase().includes("co-run")
      ) {
        ruleType = "coRun"
        ruleName = "Co-run Rule"
        parameters = { tasks: ["T1", "T2"] }
      } else if (
        naturalLanguageRule.toLowerCase().includes("limit") ||
        naturalLanguageRule.toLowerCase().includes("maximum")
      ) {
        ruleType = "loadLimit"
        ruleName = "Load Limit Rule"
        parameters = { workerGroup: "All", maxSlots: 5 }
      } else if (naturalLanguageRule.toLowerCase().includes("phase")) {
        ruleType = "phaseWindow"
        ruleName = "Phase Window Rule"
        parameters = { taskId: "T1", allowedPhases: [1, 2, 3] }
      }

      const aiRule: Rule = {
        id: Date.now().toString(),
        type: ruleType,
        name: ruleName,
        description: ruleDescription,
        parameters,
        active: true,
      }

      dispatch({ type: "ADD_RULE", payload: aiRule })
      setNaturalLanguageRule("")
    } catch (error) {
      console.error("Error processing natural language rule:", error)
    } finally {
      setIsProcessingNL(false)
    }
  }

  const renderRuleParameters = (rule: Rule) => {
    // Unchanged rendering logic
    switch (rule.type) {
      case "coRun":
        return (
          <div className="text-sm text-muted-foreground">
            Tasks: {rule.parameters.tasks?.join(", ") || "None specified"}
          </div>
        )
      case "loadLimit":
        return (
          <div className="text-sm text-muted-foreground">
            Group: {rule.parameters.workerGroup || "All"}, Max: {rule.parameters.maxSlots || 0}
          </div>
        )
      case "phaseWindow":
        return (
          <div className="text-sm text-muted-foreground">
            Task: {rule.parameters.taskId || "None"}, Phases: {rule.parameters.allowedPhases?.join(", ") || "None"}
          </div>
        )
      default:
        return <div className="text-sm text-muted-foreground">Custom parameters</div>
    }
  }

  // Only UI changes below this point
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 py-5 px-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Settings className="h-6 w-6 text-indigo-700" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-800">Rule Configuration</CardTitle>
              <CardDescription className="text-indigo-600 font-medium">
                Create and manage business rules
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs defaultValue="manual" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="manual" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-3"
              >
                Manual Builder
              </TabsTrigger>
              <TabsTrigger 
                value="ai" 
                className="flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-3"
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                AI Generator
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="font-medium text-gray-700 flex items-center gap-2">
                    Rule Type
                  </Label>
                  <Select
                    value={newRule.type}
                    onValueChange={(value) => setNewRule({ ...newRule, type: value as Rule["type"] })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select rule type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      {ruleTypes.map((type) => (
                        <SelectItem 
                          key={type.value} 
                          value={type.value}
                          className="py-3 rounded-lg hover:bg-indigo-50"
                        >
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-gray-700">Rule Name</Label>
                  <Input
                    placeholder="Enter rule name"
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-medium text-gray-700">Description</Label>
                <Textarea
                  placeholder="Describe what this rule does"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>

              <Button 
                onClick={addRule} 
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </TabsContent>

            <TabsContent value="ai" className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-medium text-gray-700 flex items-center gap-2">
                    <Bot className="h-4 w-4 text-amber-500" />
                    Describe your rule
                  </Label>
                  <Textarea
                    placeholder="e.g., 'Tasks T1 and T2 should always run together'"
                    value={naturalLanguageRule}
                    onChange={(e) => setNaturalLanguageRule(e.target.value)}
                    rows={4}
                    className="min-h-[120px]"
                  />
                </div>

                <Button
                  onClick={processNaturalLanguageRule}
                  disabled={isProcessingNL || !naturalLanguageRule.trim()}
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  {isProcessingNL ? (
                    <>
                      <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Rule...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-100">
                  <h4 className="font-medium text-gray-800 flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    AI Rule Examples
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      <span>"Tasks T1 and T2 must run together"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      <span>"Limit Sales workers to 3 slots per phase"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      <span>"Task T5 can only run in phases 1-3"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      <span>"High priority clients get preference"</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Active Rules */}
      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 py-5 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <List className="h-6 w-6 text-indigo-700" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Active Rules
              </CardTitle>
            </div>
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 font-medium">
              {state.rules.filter((r) => r.active).length} / {state.rules.length} Active
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {state.rules.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 bg-gray-100 rounded-full p-4 w-16 h-16 flex items-center justify-center">
                <Settings className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No rules created</h3>
              <p className="text-gray-500">Create your first rule using the builder above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {state.rules.map((rule) => (
                <div 
                  key={rule.id} 
                  className={`p-5 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    rule.active 
                      ? "border-indigo-200 bg-indigo-50" 
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-800">{rule.name}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          rule.active 
                            ? "border-indigo-300 text-indigo-700 bg-indigo-100" 
                            : "border-gray-300 text-gray-600 bg-gray-100"
                        }`}
                      >
                        {ruleTypes.find((t) => t.value === rule.type)?.label}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                    
                    <div className="text-sm text-gray-500">
                      {renderRuleParameters(rule)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <Switch 
                      checked={rule.active} 
                      onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                      className="data-[state=checked]:bg-indigo-600"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteRule(rule.id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
