import { pool } from '../config/db'
import { analyticsPatternForOwner, invalidatePattern } from '../utils/cache'

export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export const TASK_STATUSES: readonly TaskStatus[] = ['todo', 'in_progress', 'done'] as const
export const TASK_PRIORITIES: readonly TaskPriority[] = ['low', 'medium', 'high'] as const

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  owner_id: string
  due_date: Date | null
  completed_at: Date | null
  created_at: Date
  updated_at: Date
}

export interface CreateTaskInput {
  title: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string | Date | null
}

export interface UpdateTaskInput {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string | Date | null
  completed_at?: string | Date | null
}

const PG_INVALID_TEXT_REPRESENTATION = '22P02'

function isInvalidUuidError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: string }).code === PG_INVALID_TEXT_REPRESENTATION
  )
}

export async function getTasksByOwner(ownerId: string): Promise<Task[]> {
  const { rows } = await pool.query<Task>(
    `SELECT id, title, description, status, priority, owner_id, due_date, completed_at, created_at, updated_at
     FROM tasks
     WHERE owner_id = $1
     ORDER BY created_at DESC`,
    [ownerId]
  )
  return rows
}

export async function getTaskById(id: string, ownerId: string): Promise<Task | null> {
  try {
    const { rows } = await pool.query<Task>(
      `SELECT id, title, description, status, priority, owner_id, due_date, completed_at, created_at, updated_at
       FROM tasks
       WHERE id = $1 AND owner_id = $2`,
      [id, ownerId]
    )
    return rows[0] ?? null
  } catch (err) {
    if (isInvalidUuidError(err)) return null
    throw err
  }
}

export async function createTask(ownerId: string, data: CreateTaskInput): Promise<Task> {
  const { rows } = await pool.query<Task>(
    `INSERT INTO tasks (title, description, status, priority, owner_id, due_date)
     VALUES ($1, $2, COALESCE(CAST($3 AS task_status), 'todo'), COALESCE(CAST($4 AS task_priority), 'medium'), $5, $6)
     RETURNING id, title, description, status, priority, owner_id, due_date, completed_at, created_at, updated_at`,
    [
      data.title,
      data.description ?? null,
      data.status ?? null,
      data.priority ?? null,
      ownerId,
      data.due_date ?? null,
    ]
  )
  await invalidatePattern(analyticsPatternForOwner(ownerId))
  return rows[0]
}

export async function updateTask(
  id: string,
  ownerId: string,
  data: UpdateTaskInput
): Promise<Task | null> {
  const fields: string[] = []
  const values: unknown[] = []
  let i = 1

  if (data.title !== undefined) {
    fields.push(`title = $${i++}`)
    values.push(data.title)
  }
  if (data.description !== undefined) {
    fields.push(`description = $${i++}`)
    values.push(data.description)
  }
  if (data.status !== undefined) {
    fields.push(`status = CAST($${i++} AS task_status)`)
    values.push(data.status)
  }
  if (data.priority !== undefined) {
    fields.push(`priority = CAST($${i++} AS task_priority)`)
    values.push(data.priority)
  }
  if (data.due_date !== undefined) {
    fields.push(`due_date = $${i++}`)
    values.push(data.due_date)
  }
  if (data.completed_at !== undefined) {
    fields.push(`completed_at = $${i++}`)
    values.push(data.completed_at)
  }

  if (fields.length === 0) {
    return getTaskById(id, ownerId)
  }

  values.push(id)
  values.push(ownerId)

  try {
    const { rows } = await pool.query<Task>(
      `UPDATE tasks
       SET ${fields.join(', ')}
       WHERE id = $${i++} AND owner_id = $${i}
       RETURNING id, title, description, status, priority, owner_id, due_date, completed_at, created_at, updated_at`,
      values
    )
    if (rows[0]) await invalidatePattern(analyticsPatternForOwner(ownerId))
    return rows[0] ?? null
  } catch (err) {
    if (isInvalidUuidError(err)) return null
    throw err
  }
}

export async function deleteTask(id: string, ownerId: string): Promise<Task | null> {
  try {
    const { rows } = await pool.query<Task>(
      `DELETE FROM tasks
       WHERE id = $1 AND owner_id = $2
       RETURNING id, title, description, status, priority, owner_id, due_date, completed_at, created_at, updated_at`,
      [id, ownerId]
    )
    if (rows[0]) await invalidatePattern(analyticsPatternForOwner(ownerId))
    return rows[0] ?? null
  } catch (err) {
    if (isInvalidUuidError(err)) return null
    throw err
  }
}
