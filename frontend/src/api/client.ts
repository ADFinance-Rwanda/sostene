import axios from 'axios'
import type { AxiosError } from 'axios'

import keycloak from '../keycloak'
import { API_BASE_URL, TOKEN_REFRESH_THRESHOLD_SECONDS } from '../config'
import type {
  AnalyticsSummary,
  CreateTaskInput,
  CurrentUser,
  StatusBucket,
  Task,
  TimeBucket,
  UpdateTaskInput,
} from './types'

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach a fresh Keycloak bearer token to every request.
http.interceptors.request.use(async (config) => {
  if (!keycloak.authenticated) return config

  try {
    await keycloak.updateToken(TOKEN_REFRESH_THRESHOLD_SECONDS)
  } catch (err) {
    console.warn('Failed to refresh Keycloak token; user will need to log in again.', err)
  }

  if (keycloak.token) {
    config.headers.set('Authorization', `Bearer ${keycloak.token}`)
  }
  return config
})

// Send the user back to Keycloak on 401.
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) keycloak.login()
    return Promise.reject(error)
  }
)

export async function getMe(): Promise<CurrentUser> {
  const { data } = await http.get<CurrentUser>('/api/me')
  return data
}

export async function getTasks(): Promise<Task[]> {
  const { data } = await http.get<Task[]>('/api/tasks')
  return data
}

export async function getTask(id: string): Promise<Task> {
  const { data } = await http.get<Task>(`/api/tasks/${id}`)
  return data
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { data } = await http.post<Task>('/api/tasks', input)
  return data
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const { data } = await http.put<Task>(`/api/tasks/${id}`, input)
  return data
}

export async function deleteTask(id: string): Promise<void> {
  await http.delete(`/api/tasks/${id}`)
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const { data } = await http.get<AnalyticsSummary>('/api/analytics/summary')
  return data
}

export async function getTasksByStatus(): Promise<StatusBucket[]> {
  const { data } = await http.get<StatusBucket[]>('/api/analytics/tasks-by-status')
  return data
}

export async function getTasksCreatedOverTime(days = 30): Promise<TimeBucket[]> {
  const { data } = await http.get<TimeBucket[]>('/api/analytics/tasks-created-over-time', {
    params: { days },
  })
  return data
}
