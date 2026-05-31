export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

export const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL
export const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM
export const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID

// How many seconds before token expiry we proactively refresh.
export const TOKEN_REFRESH_THRESHOLD_SECONDS = 30
