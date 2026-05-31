import { Request, Response, NextFunction } from 'express'

import {
  CreateTaskInput,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TaskPriority,
  TaskStatus,
  UpdateTaskInput,
  createTask as createTaskService,
  deleteTask as deleteTaskService,
  getTaskById as getTaskByIdService,
  getTasksByOwner as getTasksByOwnerService,
  updateTask as updateTaskService,
} from '../services/tasksService'


type FieldError = { field: string; message: string }

function isString(v: unknown): v is string {
  return typeof v === 'string'
}

function isStatus(v: unknown): v is TaskStatus {
  return isString(v) && (TASK_STATUSES as readonly string[]).includes(v)
}

function isPriority(v: unknown): v is TaskPriority {
  return isString(v) && (TASK_PRIORITIES as readonly string[]).includes(v)
}

// Validates body for both create and update. `mode = 'create'` requires `title`;
// `mode = 'update'` treats every field as optional. Returns the cleaned input
// or the list of errors.
function validateTaskBody(
  body: unknown,
  mode: 'create' | 'update'
): { errors: FieldError[] } | { value: CreateTaskInput | UpdateTaskInput } {
  const data = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
  const errors: FieldError[] = []
  const out: UpdateTaskInput = {}

  // title
  if (data.title !== undefined) {
    if (!isString(data.title) || data.title.trim().length === 0) {
      errors.push({ field: 'title', message: 'title must be a non-empty string' })
    } else if (data.title.length > 255) {
      errors.push({ field: 'title', message: 'title must be at most 255 characters' })
    } else {
      out.title = data.title.trim()
    }
  } else if (mode === 'create') {
    errors.push({ field: 'title', message: 'title is required' })
  }

  // description
  if (data.description !== undefined) {
    if (data.description !== null && !isString(data.description)) {
      errors.push({ field: 'description', message: 'description must be a string or null' })
    } else {
      out.description = data.description as string | null
    }
  }

  // status
  if (data.status !== undefined) {
    if (!isStatus(data.status)) {
      errors.push({ field: 'status', message: `status must be one of: ${TASK_STATUSES.join(', ')}` })
    } else {
      out.status = data.status
    }
  }

  // priority
  if (data.priority !== undefined) {
    if (!isPriority(data.priority)) {
      errors.push({ field: 'priority', message: `priority must be one of: ${TASK_PRIORITIES.join(', ')}` })
    } else {
      out.priority = data.priority
    }
  }

  // due_date
  if (data.due_date !== undefined) {
    if (data.due_date !== null && !isString(data.due_date)) {
      errors.push({ field: 'due_date', message: 'due_date must be an ISO 8601 string or null' })
    } else {
      out.due_date = data.due_date as string | null
    }
  }

  // completed_at (update only)
  if (mode === 'update' && data.completed_at !== undefined) {
    if (data.completed_at !== null && !isString(data.completed_at)) {
      errors.push({ field: 'completed_at', message: 'completed_at must be an ISO 8601 string or null' })
    } else {
      out.completed_at = data.completed_at as string | null
    }
  }

  if (errors.length > 0) return { errors }
  return { value: out }
}

function sendValidationError(res: Response, errors: FieldError[]) {
  res.status(400).json({ error: 'BadRequest', message: 'Validation failed', details: errors })
}

function sendNotFound(res: Response) {
  res.status(404).json({ error: 'NotFound', message: 'Task not found' })
}

export async function listTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const tasks = await getTasksByOwnerService(req.user!.id)
    res.json(tasks)
  } catch (err) {
    next(err)
  }
}

export async function getTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await getTaskByIdService(String(req.params.id), req.user!.id)
    if (!task) return sendNotFound(res)
    res.json(task)
  } catch (err) {
    next(err)
  }
}

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const result = validateTaskBody(req.body, 'create')
    if ('errors' in result) return sendValidationError(res, result.errors)
    const task = await createTaskService(req.user!.id, result.value as CreateTaskInput)
    res.status(201).json(task)
  } catch (err) {
    next(err)
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const result = validateTaskBody(req.body, 'update')
    if ('errors' in result) return sendValidationError(res, result.errors)
    const task = await updateTaskService(String(req.params.id), req.user!.id, result.value)
    if (!task) return sendNotFound(res)
    res.json(task)
  } catch (err) {
    next(err)
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await deleteTaskService(String(req.params.id), req.user!.id)
    if (!task) return sendNotFound(res)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
