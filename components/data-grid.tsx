"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, CheckCircle, Edit, Save, X, User, HardHat, ClipboardCheck } from "lucide-react"
import { useData } from "@/contexts/data-context"

export default function ResourceMatrix() {
  const { state, dispatch } = useData()
  const [editingCell, setEditingCell] = useState<{ type: string; row: number; field: string } | null>(null)
  const [editValue, setEditValue] = useState("")

  const handleEdit = (type: string, row: number, field: string, currentValue: any) => {
    setEditingCell({ type, row, field })
    setEditValue(Array.isArray(currentValue) ? currentValue.join(", ") : String(currentValue))
  }

  const handleSave = () => {
    if (!editingCell) return

    const { type, row, field } = editingCell
    let processedValue: any = editValue

    if (field === "RequestedTaskIDs" || field === "Skills" || field === "RequiredSkills") {
      processedValue = editValue
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s)
    } else if (field === "AvailableSlots" || field === "PreferredPhases") {
      processedValue = editValue
        .split(",")
        .map((s) => Number.parseInt(s.trim()))
        .filter((n) => !isNaN(n))
    } else if (
      field === "PriorityLevel" ||
      field === "MaxLoadPerPhase" ||
      field === "Duration" ||
      field === "MaxConcurrent" ||
      field === "QualificationLevel"
    ) {
      processedValue = Number.parseInt(editValue)
    }

    switch (type) {
      case "clients":
        const updatedClient = { ...state.clients[row], [field]: processedValue }
        dispatch({ type: "UPDATE_CLIENT", payload: { index: row, client: updatedClient } })
        break
      case "workers":
        const updatedWorker = { ...state.workers[row], [field]: processedValue }
        dispatch({ type: "UPDATE_WORKER", payload: { index: row, worker: updatedWorker } })
        break
      case "tasks":
        const updatedTask = { ...state.tasks[row], [field]: processedValue }
        dispatch({ type: "UPDATE_TASK", payload: { index: row, task: updatedTask } })
        break
    }

    setEditingCell(null)
    setEditValue("")
  }

  const handleCancel = () => {
    setEditingCell(null)
    setEditValue("")
  }

  const getValidationStatus = (type: string, row: number, field?: string) => {
    const errors = state.validationErrors.filter(
      (error) => error.entity === type && (field ? error.field === field : true),
    )

    if (errors.some((e) => e.severity === "error")) return "error"
    if (errors.some((e) => e.severity === "warning")) return "warning"
    return "valid"
  }

  const renderCell = (value: any, type: string, row: number, field: string) => {
    const isEditing = editingCell?.type === type && editingCell?.row === row && editingCell?.field === field
    const status = getValidationStatus(type, row, field)

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 border-cyan-500 focus:ring-cyan-300"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave()
              if (e.key === "Escape") handleCancel()
            }}
            autoFocus
          />
          <Button size="sm" variant="outline" onClick={handleSave} title="Save (Enter)" className="bg-cyan-500 text-white hover:bg-cyan-600">
            <Save className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel} title="Cancel (Escape)" className="bg-gray-200 hover:bg-gray-300">
            <X className="h-3 w-3" />
          </Button>
        </div>
      )
    }

    const displayValue = Array.isArray(value) ? value.join(", ") : String(value)

    return (
      <div className="flex items-center gap-2 group cursor-pointer hover:bg-cyan-50 p-2 rounded-md transition-all">
        <span
          className={`flex-1 ${status === "error" ? "text-red-600 font-bold" : status === "warning" ? "text-yellow-600" : "text-gray-700"}`}
        >
          {displayValue}
        </span>
        {status === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
        {status === "warning" && <AlertCircle className="h-4 w-4 text-yellow-500" />}
        {status === "valid" && <CheckCircle className="h-4 w-4 text-green-500" />}
        <Button
          size="sm"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 bg-cyan-100 hover:bg-cyan-200"
          onClick={() => handleEdit(type, row, field, value)}
          title="Click to edit"
        >
          <Edit className="h-3 w-3 text-cyan-700" />
        </Button>
      </div>
    )
  }

  const ClientsTable = () => (
    <Table className="border-separate border-spacing-y-1">
      <TableHeader className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
        <TableRow className="hover:bg-transparent">
          <TableHead className="text-white rounded-l-lg">Client ID</TableHead>
          <TableHead className="text-white">Name</TableHead>
          <TableHead className="text-white">Priority</TableHead>
          <TableHead className="text-white">Requested Tasks</TableHead>
          <TableHead className="text-white">Group</TableHead>
          <TableHead className="text-white rounded-r-lg">Attributes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {state.clients.map((client, index) => (
          <TableRow
            key={client.ClientID}
            className={`${getValidationStatus("clients", index) === "error" ? "bg-red-50" : "bg-white hover:bg-cyan-50"} shadow-sm rounded-lg`}
          >
            <TableCell className="border-l-4 border-cyan-300 rounded-l-lg">{renderCell(client.ClientID, "clients", index, "ClientID")}</TableCell>
            <TableCell>{renderCell(client.ClientName, "clients", index, "ClientName")}</TableCell>
            <TableCell>{renderCell(client.PriorityLevel, "clients", index, "PriorityLevel")}</TableCell>
            <TableCell>{renderCell(client.RequestedTaskIDs, "clients", index, "RequestedTaskIDs")}</TableCell>
            <TableCell>{renderCell(client.GroupTag, "clients", index, "GroupTag")}</TableCell>
            <TableCell className="rounded-r-lg">{renderCell(client.AttributesJSON, "clients", index, "AttributesJSON")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  const WorkersTable = () => (
    <Table className="border-separate border-spacing-y-1">
      <TableHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
        <TableRow className="hover:bg-transparent">
          <TableHead className="text-white rounded-l-lg">Worker ID</TableHead>
          <TableHead className="text-white">Name</TableHead>
          <TableHead className="text-white">Skills</TableHead>
          <TableHead className="text-white">Available Slots</TableHead>
          <TableHead className="text-white">Max Load</TableHead>
          <TableHead className="text-white">Group</TableHead>
          <TableHead className="text-white rounded-r-lg">Qualification</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {state.workers.map((worker, index) => (
          <TableRow
            key={worker.WorkerID}
            className={`${getValidationStatus("workers", index) === "error" ? "bg-red-50" : "bg-white hover:bg-cyan-50"} shadow-sm rounded-lg`}
          >
            <TableCell className="border-l-4 border-teal-300 rounded-l-lg">{renderCell(worker.WorkerID, "workers", index, "WorkerID")}</TableCell>
            <TableCell>{renderCell(worker.WorkerName, "workers", index, "WorkerName")}</TableCell>
            <TableCell>{renderCell(worker.Skills, "workers", index, "Skills")}</TableCell>
            <TableCell>{renderCell(worker.AvailableSlots, "workers", index, "AvailableSlots")}</TableCell>
            <TableCell>{renderCell(worker.MaxLoadPerPhase, "workers", index, "MaxLoadPerPhase")}</TableCell>
            <TableCell>{renderCell(worker.WorkerGroup, "workers", index, "WorkerGroup")}</TableCell>
            <TableCell className="rounded-r-lg">{renderCell(worker.QualificationLevel, "workers", index, "QualificationLevel")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  const TasksTable = () => (
    <Table className="border-separate border-spacing-y-1">
      <TableHeader className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white">
        <TableRow className="hover:bg-transparent">
          <TableHead className="text-white rounded-l-lg">Task ID</TableHead>
          <TableHead className="text-white">Name</TableHead>
          <TableHead className="text-white">Category</TableHead>
          <TableHead className="text-white">Duration</TableHead>
          <TableHead className="text-white">Required Skills</TableHead>
          <TableHead className="text-white">Preferred Phases</TableHead>
          <TableHead className="text-white rounded-r-lg">Max Concurrent</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {state.tasks.map((task, index) => (
          <TableRow key={task.TaskID} className={`${getValidationStatus("tasks", index) === "error" ? "bg-red-50" : "bg-white hover:bg-cyan-50"} shadow-sm rounded-lg`}>
            <TableCell className="border-l-4 border-teal-400 rounded-l-lg">{renderCell(task.TaskID, "tasks", index, "TaskID")}</TableCell>
            <TableCell>{renderCell(task.TaskName, "tasks", index, "TaskName")}</TableCell>
            <TableCell>{renderCell(task.Category, "tasks", index, "Category")}</TableCell>
            <TableCell>{renderCell(task.Duration, "tasks", index, "Duration")}</TableCell>
            <TableCell>{renderCell(task.RequiredSkills, "tasks", index, "RequiredSkills")}</TableCell>
            <TableCell>{renderCell(task.PreferredPhases, "tasks", index, "PreferredPhases")}</TableCell>
            <TableCell className="rounded-r-lg">{renderCell(task.MaxConcurrent, "tasks", index, "MaxConcurrent")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-cyan-700 to-teal-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <ClipboardCheck className="h-6 w-6" />
          <div>
            <h2 className="text-xl">Resource Allocation Matrix</h2>
            <CardDescription className="text-cyan-100 pt-1">
              Edit resources directly in the matrix. Hover over cells and click the edit icon to modify values.
            </CardDescription>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="clients" className="space-y-5">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 gap-1">
            <TabsTrigger 
              value="clients" 
              className="flex items-center gap-2 data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
            >
              <User className="h-4 w-4" />
              Clients ({state.clients.length})
            </TabsTrigger>
            <TabsTrigger 
              value="workers" 
              className="flex items-center gap-2 data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
            >
              <HardHat className="h-4 w-4" />
              Workforce ({state.workers.length})
            </TabsTrigger>
            <TabsTrigger 
              value="tasks" 
              className="flex items-center gap-2 data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
            >
              <ClipboardCheck className="h-4 w-4" />
              Activities ({state.tasks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-4">
            <div className="rounded-lg border border-gray-200 overflow-auto max-h-[500px] shadow-inner">
              <ClientsTable />
            </div>
          </TabsContent>

          <TabsContent value="workers" className="space-y-4">
            <div className="rounded-lg border border-gray-200 overflow-auto max-h-[500px] shadow-inner">
              <WorkersTable />
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="rounded-lg border border-gray-200 overflow-auto max-h-[500px] shadow-inner">
              <TasksTable />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}