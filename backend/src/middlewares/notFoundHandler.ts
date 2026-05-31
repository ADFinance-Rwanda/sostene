import { Request, Response } from 'express'

// Catches any request that didn't match a route above it.
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: 'NotFound',
    message: `Route ${req.method} ${req.path} not found`,
  })
}
