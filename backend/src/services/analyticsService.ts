import { pool } from '../config/db'
import { TASK_STATUSES, TaskStatus } from './tasksService'
import { analyticsKey, cached } from '../utils/cache'

const CACHE_TTL_SECONDS = 30

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
  date: string // ISO date (YYYY-MM-DD)
  count: number
}

export async function getSummary(ownerId: string): Promise<AnalyticsSummary> {
  return cached(analyticsKey('summary', ownerId), CACHE_TTL_SECONDS, async () => {
    const { rows } = await pool.query<{ status: TaskStatus; count: string }>(
      `SELECT status, CAST(COUNT(*) AS text) AS count
       FROM tasks
       WHERE owner_id = $1
       GROUP BY status`,
      [ownerId]
    )

    const counts: Record<TaskStatus, number> = { todo: 0, in_progress: 0, done: 0 }
    for (const row of rows) counts[row.status] = Number(row.count)

    const total = counts.todo + counts.in_progress + counts.done
    const completion_percentage = total === 0 ? 0 : Math.round((counts.done / total) * 100)

    return {
      total,
      todo: counts.todo,
      in_progress: counts.in_progress,
      done: counts.done,
      completion_percentage,
    }
  })
}

export async function getTasksByStatus(ownerId: string): Promise<StatusBucket[]> {
  return cached(analyticsKey('status', ownerId), CACHE_TTL_SECONDS, async () => {
    const { rows } = await pool.query<{ status: TaskStatus; count: string }>(
      `SELECT status, CAST(COUNT(*) AS text) AS count
       FROM tasks
       WHERE owner_id = $1
       GROUP BY status`,
      [ownerId]
    )

    const map = new Map<TaskStatus, number>()
    for (const row of rows) map.set(row.status, Number(row.count))

    return TASK_STATUSES.map((status) => ({ status, count: map.get(status) ?? 0 }))
  })
}

export async function getTasksCreatedOverTime(
  ownerId: string,
  days: number = 30
): Promise<TimeBucket[]> {
  return cached(analyticsKey('timeline', ownerId, days), CACHE_TTL_SECONDS, async () => {
    const { rows } = await pool.query<{ day: Date; count: string }>(
      `SELECT CAST(date_trunc('day', d) AS date) AS day,
              CAST(COALESCE(t.count, 0) AS text) AS count
       FROM generate_series(
              (CURRENT_DATE - (CAST($2 AS int) - 1) * INTERVAL '1 day'),
              CURRENT_DATE,
              INTERVAL '1 day'
            ) AS d
       LEFT JOIN (
         SELECT CAST(date_trunc('day', created_at) AS date) AS day,
                COUNT(*) AS count
         FROM tasks
         WHERE owner_id = $1
           AND created_at >= (CURRENT_DATE - (CAST($2 AS int) - 1) * INTERVAL '1 day')
         GROUP BY day
       ) t ON t.day = CAST(d AS date)
       ORDER BY day ASC`,
      [ownerId, days]
    )

    return rows.map((row) => ({
      date: new Date(row.day).toISOString().slice(0, 10),
      count: Number(row.count),
    }))
  })
}
