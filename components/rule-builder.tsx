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
import { Plus, Settings, Trash2, Sparkles, Wand2 } from "lucide-react"
import { useData } from "@/contexts/data-context"
import type { Rule } from "@/contexts/data-context"

export default function RuleBuilder() {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-600" />
            <CardTitle>Business Rules Builder</CardTitle>
          </div>
          <CardDescription>Create and manage business rules for resource allocation</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Rule Builder</TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Rule Generator
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              {/* Manual Rule Builder */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-type">Rule Type</Label>
                  <Select
                    value={newRule.type}
                    onValueChange={(value) => setNewRule({ ...newRule, type: value as Rule["type"] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rule type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ruleTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    placeholder="Enter rule name"
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rule-description">Description</Label>
                <Textarea
                  id="rule-description"
                  placeholder="Describe what this rule does"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                />
              </div>

              <Button onClick={addRule} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              {/* AI Rule Generator */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nl-rule">Describe your rule in plain English</Label>
                  <Textarea
                    id="nl-rule"
                    placeholder="e.g., 'Tasks T1 and T2 should always run together' or 'Limit workers in Sales group to maximum 3 slots per phase'"
                    value={naturalLanguageRule}
                    onChange={(e) => setNaturalLanguageRule(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={processNaturalLanguageRule}
                  disabled={isProcessingNL || !naturalLanguageRule.trim()}
                  className="w-full"
                >
                  {isProcessingNL ? (
                    <>
                      <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Rule with AI
                    </>
                  )}
                </Button>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">AI Rule Examples:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• "Tasks T1 and T2 must run together"</li>
                    <li>• "Limit Sales workers to 3 slots per phase"</li>
                    <li>• "Task T5 can only run in phases 1-3"</li>
                    <li>• "High priority clients get preference"</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Active Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Active Rules ({state.rules.length})
            <Badge variant="secondary">{state.rules.filter((r) => r.active).length} Active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {state.rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No rules created yet</p>
              <p className="text-sm">Add your first rule above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {state.rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{rule.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {ruleTypes.find((t) => t.value === rule.type)?.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                    {renderRuleParameters(rule)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={rule.active} onCheckedChange={(checked) => toggleRule(rule.id, checked)} />
                    <Button variant="ghost" size="sm" onClick={() => deleteRule(rule.id)}>
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
