import { NextFunction, Request, Response } from 'express'
import jwt, { JwtHeader, JwtPayload, SigningKeyCallback } from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'

import {
  KEYCLOAK_ISSUER,
  KEYCLOAK_JWKS_URI,
  KEYCLOAK_REALM,
  KEYCLOAK_URL,
} from '../config/constants'

// Add `user` to Express's Request type so downstream handlers can read it.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; email?: string; name?: string }
    }
  }
}

const configured = Boolean(KEYCLOAK_URL && KEYCLOAK_REALM)

if (!configured) {
  console.warn('KEYCLOAK_URL or KEYCLOAK_REALM is not set; every request will 401.')
}

const jwks = configured
  ? jwksClient({
      jwksUri: KEYCLOAK_JWKS_URI as string,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 10 * 60 * 1000,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    })
  : null

function getSigningKey(header: JwtHeader, cb: SigningKeyCallback) {
  if (!jwks) return cb(new Error('JWKS client not initialized'))
  if (!header.kid) return cb(new Error('Token header missing "kid"'))
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err || !key) return cb(err ?? new Error('Signing key not found'))
    cb(null, key.getPublicKey())
  })
}

function unauthorized(res: Response, message: string) {
  res.status(401).json({ error: 'Unauthorized', message })
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!configured) return unauthorized(res, 'Authentication is not configured on the server')

  const header = req.headers.authorization
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    return unauthorized(res, 'Missing or malformed Authorization header')
  }

  const token = header.slice(7).trim()
  if (!token) return unauthorized(res, 'Bearer token is empty')

  jwt.verify(token, getSigningKey, { issuer: KEYCLOAK_ISSUER, algorithms: ['RS256'] }, (err, decoded) => {
    if (err) return unauthorized(res, `Invalid token: ${err.message}`)
    if (!decoded || typeof decoded === 'string') return unauthorized(res, 'Invalid token payload')

    const payload = decoded as JwtPayload & {
      email?: string
      name?: string
      preferred_username?: string
    }

    if (!payload.sub) return unauthorized(res, 'Token is missing "sub" claim')

    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name ?? payload.preferred_username,
    }
    next()
  })
}

export default authMiddleware
