export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done']
export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high']

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  owner_id: string
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateTaskInput {
  title: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string | null
}

export interface UpdateTaskInput {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string | null
  completed_at?: string | null
}

export interface CurrentUser {
  id: string
  email?: string
  name?: string
}

export interface AnalyticsSummary {
  total: number
  todo: number
  in_progress: number
  done: number
  completion_percentage: number
}

export interface StatusBucket {
  status: TaskStatus
  count: number
}

export interface TimeBucket {
  date: string
  count: number
}
