// Single source of truth for every env var the backend reads. New env vars

import 'dotenv/config'

function str(name: string): string | undefined {
  const value = process.env[name]
  return value === undefined || value === '' ? undefined : value
}

function int(name: string, fallback: number): number {
  const raw = process.env[name]
  if (raw === undefined || raw === '') return fallback
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) {
    throw new Error(`Env var ${name} must be a number; got "${raw}"`)
  }
  return parsed
}

export const NODE_ENV = str('NODE_ENV') ?? 'development'
export const PORT = int('PORT', 5000)

// Postgres
export const DATABASE_URL = str('DATABASE_URL')
export const POSTGRES_HOST = str('POSTGRES_HOST')
export const POSTGRES_PORT = int('POSTGRES_PORT', 5432)
export const POSTGRES_USER = str('POSTGRES_USER')
export const POSTGRES_PASSWORD = str('POSTGRES_PASSWORD')
export const POSTGRES_DB = str('POSTGRES_DB')

// Redis
export const REDIS_URL = str('REDIS_URL')
export const REDIS_HOST = str('REDIS_HOST')
export const REDIS_PORT = int('REDIS_PORT', 6379)
export const REDIS_PASSWORD = str('REDIS_PASSWORD')

// Keycloak: KEYCLOAK_URL is the internal URL the backend uses to fetch JWKS
// (http://keycloak:8080); KEYCLOAK_PUBLIC_URL is the public URL the browser
// sees, and the one baked into the JWT `iss` claim. They differ in Docker.
export const KEYCLOAK_URL = str('KEYCLOAK_URL')
export const KEYCLOAK_PUBLIC_URL = str('KEYCLOAK_PUBLIC_URL') ?? KEYCLOAK_URL
export const KEYCLOAK_REALM = str('KEYCLOAK_REALM')

export const KEYCLOAK_ISSUER =
  KEYCLOAK_PUBLIC_URL && KEYCLOAK_REALM
    ? `${KEYCLOAK_PUBLIC_URL}/realms/${KEYCLOAK_REALM}`
    : undefined

export const KEYCLOAK_JWKS_URI =
  KEYCLOAK_URL && KEYCLOAK_REALM
    ? `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`
    : undefined
