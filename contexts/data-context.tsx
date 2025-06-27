"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"

export interface Client {
  ClientID: string
  ClientName: string
  PriorityLevel: number
  RequestedTaskIDs: string[]
  GroupTag: string
  AttributesJSON: string
}

export interface Worker {
  WorkerID: string
  WorkerName: string
  Skills: string[]
  AvailableSlots: number[]
  MaxLoadPerPhase: number
  WorkerGroup: string
  QualificationLevel: number
}

export interface Task {
  TaskID: string
  TaskName: string
  Category: string
  Duration: number
  RequiredSkills: string[]
  PreferredPhases: number[]
  MaxConcurrent: number
}

export interface ValidationError {
  id: string
  type: string
  message: string
  entity: string
  field?: string
  severity: "error" | "warning"
}

export interface Rule {
  id: string
  type: "coRun" | "slotRestriction" | "loadLimit" | "phaseWindow" | "patternMatch" | "precedence"
  name: string
  description: string
  parameters: Record<string, any>
  active: boolean
}

export interface Priority {
  id: string
  name: string
  weight: number
  description: string
}

interface DataState {
  clients: Client[]
  workers: Worker[]
  tasks: Task[]
  validationErrors: ValidationError[]
  rules: Rule[]
  priorities: Priority[]
  searchResults: any[]
  isLoading: boolean
}

type DataAction =
  | { type: "SET_CLIENTS"; payload: Client[] }
  | { type: "SET_WORKERS"; payload: Worker[] }
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "UPDATE_CLIENT"; payload: { index: number; client: Client } }
  | { type: "UPDATE_WORKER"; payload: { index: number; worker: Worker } }
  | { type: "UPDATE_TASK"; payload: { index: number; task: Task } }
  | { type: "SET_VALIDATION_ERRORS"; payload: ValidationError[] }
  | { type: "ADD_RULE"; payload: Rule }
  | { type: "UPDATE_RULE"; payload: { id: string; rule: Partial<Rule> } }
  | { type: "DELETE_RULE"; payload: string }
  | { type: "SET_PRIORITIES"; payload: Priority[] }
  | { type: "UPDATE_PRIORITY"; payload: { id: string; priority: Partial<Priority> } }
  | { type: "SET_SEARCH_RESULTS"; payload: any[] }
  | { type: "SET_LOADING"; payload: boolean }

const initialState: DataState = {
  clients: [],
  workers: [],
  tasks: [],
  validationErrors: [],
  rules: [],
  priorities: [
    { id: "1", name: "Priority Level", weight: 0.3, description: "Client priority importance" },
    { id: "2", name: "Task Fulfillment", weight: 0.25, description: "Requested tasks completion" },
    { id: "3", name: "Worker Fairness", weight: 0.2, description: "Equal workload distribution" },
    { id: "4", name: "Skill Matching", weight: 0.15, description: "Optimal skill utilization" },
    { id: "5", name: "Phase Efficiency", weight: 0.1, description: "Timeline optimization" },
  ],
  searchResults: [],
  isLoading: false,
}

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case "SET_CLIENTS":
      return { ...state, clients: action.payload }
    case "SET_WORKERS":
      return { ...state, workers: action.payload }
    case "SET_TASKS":
      return { ...state, tasks: action.payload }
    case "UPDATE_CLIENT":
      const updatedClients = [...state.clients]
      updatedClients[action.payload.index] = action.payload.client
      return { ...state, clients: updatedClients }
    case "UPDATE_WORKER":
      const updatedWorkers = [...state.workers]
      updatedWorkers[action.payload.index] = action.payload.worker
      return { ...state, workers: updatedWorkers }
    case "UPDATE_TASK":
      const updatedTasks = [...state.tasks]
      updatedTasks[action.payload.index] = action.payload.task
      return { ...state, tasks: updatedTasks }
    case "SET_VALIDATION_ERRORS":
      return { ...state, validationErrors: action.payload }
    case "ADD_RULE":
      return { ...state, rules: [...state.rules, action.payload] }
    case "UPDATE_RULE":
      return {
        ...state,
        rules: state.rules.map((rule) => (rule.id === action.payload.id ? { ...rule, ...action.payload.rule } : rule)),
      }
    case "DELETE_RULE":
      return { ...state, rules: state.rules.filter((rule) => rule.id !== action.payload) }
    case "SET_PRIORITIES":
      return { ...state, priorities: action.payload }
    case "UPDATE_PRIORITY":
      return {
        ...state,
        priorities: state.priorities.map((priority) =>
          priority.id === action.payload.id ? { ...priority, ...action.payload.priority } : priority,
        ),
      }
    case "SET_SEARCH_RESULTS":
      return { ...state, searchResults: action.payload }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

const DataContext = createContext<{
  state: DataState
  dispatch: React.Dispatch<DataAction>
} | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialState)

  return <DataContext.Provider value={{ state, dispatch }}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
