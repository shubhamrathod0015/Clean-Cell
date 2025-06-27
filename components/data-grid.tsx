"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, CheckCircle, Edit, Save, X, Users, Briefcase, ClipboardList } from "lucide-react"
import { useData } from "@/contexts/data-context"

export default function DataGrid() {
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

    // Process different field types
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

    // Update the data
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
            className="h-8"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave()
              if (e.key === "Escape") handleCancel()
            }}
            autoFocus
          />
          <Button size="sm" variant="ghost" onClick={handleSave} title="Save (Enter)">
            <Save className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel} title="Cancel (Escape)">
            <X className="h-3 w-3" />
          </Button>
        </div>
      )
    }

    const displayValue = Array.isArray(value) ? value.join(", ") : String(value)

    return (
      <div className="flex items-center gap-2 group cursor-pointer hover:bg-gray-50 p-1 rounded">
        <span
          className={`flex-1 ${status === "error" ? "text-red-600" : status === "warning" ? "text-yellow-600" : ""}`}
        >
          {displayValue}
        </span>
        {status === "error" && <AlertCircle className="h-3 w-3 text-red-500" />}
        {status === "warning" && <AlertCircle className="h-3 w-3 text-yellow-500" />}
        {status === "valid" && <CheckCircle className="h-3 w-3 text-green-500" />}
        <Button
          size="sm"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
          onClick={() => handleEdit(type, row, field, value)}
          title="Click to edit"
        >
          <Edit className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  const ClientsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Requested Tasks</TableHead>
          <TableHead>Group</TableHead>
          <TableHead>Attributes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {state.clients.map((client, index) => (
          <TableRow
            key={client.ClientID}
            className={getValidationStatus("clients", index) === "error" ? "bg-red-50" : ""}
          >
            <TableCell>{renderCell(client.ClientID, "clients", index, "ClientID")}</TableCell>
            <TableCell>{renderCell(client.ClientName, "clients", index, "ClientName")}</TableCell>
            <TableCell>{renderCell(client.PriorityLevel, "clients", index, "PriorityLevel")}</TableCell>
            <TableCell>{renderCell(client.RequestedTaskIDs, "clients", index, "RequestedTaskIDs")}</TableCell>
            <TableCell>{renderCell(client.GroupTag, "clients", index, "GroupTag")}</TableCell>
            <TableCell>{renderCell(client.AttributesJSON, "clients", index, "AttributesJSON")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  const WorkersTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Worker ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Skills</TableHead>
          <TableHead>Available Slots</TableHead>
          <TableHead>Max Load</TableHead>
          <TableHead>Group</TableHead>
          <TableHead>Qualification</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {state.workers.map((worker, index) => (
          <TableRow
            key={worker.WorkerID}
            className={getValidationStatus("workers", index) === "error" ? "bg-red-50" : ""}
          >
            <TableCell>{renderCell(worker.WorkerID, "workers", index, "WorkerID")}</TableCell>
            <TableCell>{renderCell(worker.WorkerName, "workers", index, "WorkerName")}</TableCell>
            <TableCell>{renderCell(worker.Skills, "workers", index, "Skills")}</TableCell>
            <TableCell>{renderCell(worker.AvailableSlots, "workers", index, "AvailableSlots")}</TableCell>
            <TableCell>{renderCell(worker.MaxLoadPerPhase, "workers", index, "MaxLoadPerPhase")}</TableCell>
            <TableCell>{renderCell(worker.WorkerGroup, "workers", index, "WorkerGroup")}</TableCell>
            <TableCell>{renderCell(worker.QualificationLevel, "workers", index, "QualificationLevel")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  const TasksTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Required Skills</TableHead>
          <TableHead>Preferred Phases</TableHead>
          <TableHead>Max Concurrent</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {state.tasks.map((task, index) => (
          <TableRow key={task.TaskID} className={getValidationStatus("tasks", index) === "error" ? "bg-red-50" : ""}>
            <TableCell>{renderCell(task.TaskID, "tasks", index, "TaskID")}</TableCell>
            <TableCell>{renderCell(task.TaskName, "tasks", index, "TaskName")}</TableCell>
            <TableCell>{renderCell(task.Category, "tasks", index, "Category")}</TableCell>
            <TableCell>{renderCell(task.Duration, "tasks", index, "Duration")}</TableCell>
            <TableCell>{renderCell(task.RequiredSkills, "tasks", index, "RequiredSkills")}</TableCell>
            <TableCell>{renderCell(task.PreferredPhases, "tasks", index, "PreferredPhases")}</TableCell>
            <TableCell>{renderCell(task.MaxConcurrent, "tasks", index, "MaxConcurrent")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Data Grid - Inline Editing
        </CardTitle>
        <CardDescription>
          Click on any cell to edit. Changes are validated in real-time. Hover over cells to see edit button.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="clients" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clients ({state.clients.length})
            </TabsTrigger>
            <TabsTrigger value="workers" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Workers ({state.workers.length})
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Tasks ({state.tasks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-4">
            <div className="rounded-md border overflow-auto max-h-96">
              <ClientsTable />
            </div>
          </TabsContent>

          <TabsContent value="workers" className="space-y-4">
            <div className="rounded-md border overflow-auto max-h-96">
              <WorkersTable />
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="rounded-md border overflow-auto max-h-96">
              <TasksTable />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
