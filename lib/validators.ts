import type { Client, Worker, Task, ValidationError } from "@/contexts/data-context"

export function validateData(
  data: any[],
  type: string,
  allData?: { clients?: Client[]; workers?: Worker[]; tasks?: Task[] },
): ValidationError[] {
  let errors: ValidationError[] = []

  switch (type) {
    case "clients":
      errors = validateClients(data as Client[])
      break
    case "workers":
      errors = validateWorkers(data as Worker[])
      break
    case "tasks":
      errors = validateTasks(data as Task[])
      break
    default:
      return errors
  }

  // Add cross-reference validation if all data is available
  if (allData && allData.clients && allData.workers && allData.tasks) {
    const crossRefErrors = validateCrossReferences(allData.clients, allData.workers, allData.tasks)
    errors.push(...crossRefErrors)
  }

  return errors
}

function validateClients(clients: Client[]): ValidationError[] {
  const errors: ValidationError[] = []
  const seenIds = new Set<string>()

  clients.forEach((client, index) => {
    // Check for duplicate IDs
    if (seenIds.has(client.ClientID)) {
      errors.push({
        id: `client-${index}-duplicate-id`,
        type: "Duplicate ID",
        message: `Client ID ${client.ClientID} is duplicated`,
        entity: "clients",
        field: "ClientID",
        severity: "error",
      })
    }
    seenIds.add(client.ClientID)

    // Check required fields
    if (!client.ClientID) {
      errors.push({
        id: `client-${index}-missing-id`,
        type: "Missing Required Field",
        message: "Client ID is required",
        entity: "clients",
        field: "ClientID",
        severity: "error",
      })
    }

    if (!client.ClientName) {
      errors.push({
        id: `client-${index}-missing-name`,
        type: "Missing Required Field",
        message: "Client Name is required",
        entity: "clients",
        field: "ClientName",
        severity: "error",
      })
    }

    // Check priority level range
    if (client.PriorityLevel < 1 || client.PriorityLevel > 5) {
      errors.push({
        id: `client-${index}-invalid-priority`,
        type: "Out of Range Value",
        message: "Priority Level must be between 1 and 5",
        entity: "clients",
        field: "PriorityLevel",
        severity: "error",
      })
    }

    // Check JSON format
    if (client.AttributesJSON) {
      try {
        JSON.parse(client.AttributesJSON)
      } catch {
        // Check if it's plain text (not starting with { or ")
        if (!client.AttributesJSON.startsWith("{") && !client.AttributesJSON.startsWith('"')) {
          errors.push({
            id: `client-${index}-plain-text-json`,
            type: "Malformed JSON",
            message: `AttributesJSON contains plain text instead of JSON: "${client.AttributesJSON.substring(0, 30)}..."`,
            entity: "clients",
            field: "AttributesJSON",
            severity: "warning",
          })
        } else {
          errors.push({
            id: `client-${index}-invalid-json`,
            type: "Malformed JSON",
            message: "AttributesJSON contains invalid JSON syntax",
            entity: "clients",
            field: "AttributesJSON",
            severity: "error",
          })
        }
      }
    }
  })

  return errors
}

function validateWorkers(workers: Worker[]): ValidationError[] {
  const errors: ValidationError[] = []
  const seenIds = new Set<string>()

  workers.forEach((worker, index) => {
    // Check for duplicate IDs
    if (seenIds.has(worker.WorkerID)) {
      errors.push({
        id: `worker-${index}-duplicate-id`,
        type: "Duplicate ID",
        message: `Worker ID ${worker.WorkerID} is duplicated`,
        entity: "workers",
        field: "WorkerID",
        severity: "error",
      })
    }
    seenIds.add(worker.WorkerID)

    // Check required fields
    if (!worker.WorkerID) {
      errors.push({
        id: `worker-${index}-missing-id`,
        type: "Missing Required Field",
        message: "Worker ID is required",
        entity: "workers",
        field: "WorkerID",
        severity: "error",
      })
    }

    if (!worker.WorkerName) {
      errors.push({
        id: `worker-${index}-missing-name`,
        type: "Missing Required Field",
        message: "Worker Name is required",
        entity: "workers",
        field: "WorkerName",
        severity: "error",
      })
    }

    // Check available slots
    if (!Array.isArray(worker.AvailableSlots) || worker.AvailableSlots.length === 0) {
      errors.push({
        id: `worker-${index}-no-slots`,
        type: "Missing Required Field",
        message: "Worker must have at least one available slot",
        entity: "workers",
        field: "AvailableSlots",
        severity: "error",
      })
    } else {
      // Check for invalid slot numbers
      const invalidSlots = worker.AvailableSlots.filter((slot) => slot < 1 || slot > 10)
      if (invalidSlots.length > 0) {
        errors.push({
          id: `worker-${index}-invalid-slots`,
          type: "Out of Range Value",
          message: `Invalid slot numbers: ${invalidSlots.join(", ")}`,
          entity: "workers",
          field: "AvailableSlots",
          severity: "warning",
        })
      }
    }

    // Check max load per phase
    if (worker.MaxLoadPerPhase < 1) {
      errors.push({
        id: `worker-${index}-invalid-load`,
        type: "Out of Range Value",
        message: "Max Load Per Phase must be at least 1",
        entity: "workers",
        field: "MaxLoadPerPhase",
        severity: "error",
      })
    }

    // Check if max load exceeds available slots
    if (Array.isArray(worker.AvailableSlots) && worker.MaxLoadPerPhase > worker.AvailableSlots.length) {
      errors.push({
        id: `worker-${index}-overloaded`,
        type: "Overloaded Worker",
        message: `MaxLoadPerPhase (${worker.MaxLoadPerPhase}) exceeds available slots (${worker.AvailableSlots.length})`,
        entity: "workers",
        field: "MaxLoadPerPhase",
        severity: "error",
      })
    }
  })

  return errors
}

function validateTasks(tasks: Task[]): ValidationError[] {
  const errors: ValidationError[] = []
  const seenIds = new Set<string>()

  tasks.forEach((task, index) => {
    // Check for duplicate IDs
    if (seenIds.has(task.TaskID)) {
      errors.push({
        id: `task-${index}-duplicate-id`,
        type: "Duplicate ID",
        message: `Task ID ${task.TaskID} is duplicated`,
        entity: "tasks",
        field: "TaskID",
        severity: "error",
      })
    }
    seenIds.add(task.TaskID)

    // Check required fields
    if (!task.TaskID) {
      errors.push({
        id: `task-${index}-missing-id`,
        type: "Missing Required Field",
        message: "Task ID is required",
        entity: "tasks",
        field: "TaskID",
        severity: "error",
      })
    }

    if (!task.TaskName) {
      errors.push({
        id: `task-${index}-missing-name`,
        type: "Missing Required Field",
        message: "Task Name is required",
        entity: "tasks",
        field: "TaskName",
        severity: "error",
      })
    }

    // Check duration
    if (task.Duration < 1) {
      errors.push({
        id: `task-${index}-invalid-duration`,
        type: "Out of Range Value",
        message: "Duration must be at least 1 phase",
        entity: "tasks",
        field: "Duration",
        severity: "error",
      })
    }

    // Check max concurrent
    if (task.MaxConcurrent < 1) {
      errors.push({
        id: `task-${index}-invalid-concurrent`,
        type: "Out of Range Value",
        message: "Max Concurrent must be at least 1",
        entity: "tasks",
        field: "MaxConcurrent",
        severity: "error",
      })
    }

    // Check required skills
    if (!Array.isArray(task.RequiredSkills) || task.RequiredSkills.length === 0) {
      errors.push({
        id: `task-${index}-no-skills`,
        type: "Missing Required Field",
        message: "Task must specify at least one required skill",
        entity: "tasks",
        field: "RequiredSkills",
        severity: "warning",
      })
    }

    // Check preferred phases
    if (!Array.isArray(task.PreferredPhases) || task.PreferredPhases.length === 0) {
      errors.push({
        id: `task-${index}-no-phases`,
        type: "Missing Required Field",
        message: "Task must specify preferred phases",
        entity: "tasks",
        field: "PreferredPhases",
        severity: "warning",
      })
    }
  })

  return errors
}

export function validateCrossReferences(clients: Client[], workers: Worker[], tasks: Task[]): ValidationError[] {
  const errors: ValidationError[] = []

  // Create sets of valid IDs for cross-reference checking
  const validTaskIds = new Set(tasks.map((t) => t.TaskID))
  const allRequiredSkills = new Set(tasks.flatMap((t) => t.RequiredSkills || []))
  const allWorkerSkills = new Set(workers.flatMap((w) => w.Skills || []))

  // Check for invalid task references in client requests
  clients.forEach((client, index) => {
    if (Array.isArray(client.RequestedTaskIDs)) {
      const invalidTasks = client.RequestedTaskIDs.filter((taskId) => {
        // Check for malformed task IDs (like TX, T99, T60, T51)
        return (
          !validTaskIds.has(taskId) ||
          taskId.includes("X") ||
          (taskId.match(/\d+/) && Number.parseInt(taskId.match(/\d+/)[0]) > 50)
        )
      })

      if (invalidTasks.length > 0) {
        errors.push({
          id: `client-${index}-invalid-task-refs`,
          type: "Unknown Task References",
          message: `Client references non-existent tasks: ${invalidTasks.join(", ")}`,
          entity: "clients",
          field: "RequestedTaskIDs",
          severity: "error",
        })
      }
    }
  })

  // Check for skill coverage - ensure all required skills are available
  const uncoveredSkills = Array.from(allRequiredSkills).filter((skill) => !allWorkerSkills.has(skill))
  if (uncoveredSkills.length > 0) {
    errors.push({
      id: "skill-coverage-gap",
      type: "Skill Coverage Gap",
      message: `No workers available with skills: ${uncoveredSkills.join(", ")}`,
      entity: "tasks",
      severity: "warning",
    })
  }

  return errors
}
