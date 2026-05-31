import { NextFunction, Request, Response } from 'express'

// Last-resort handler. Any error a controller calls `next(err)` with ends up
// here, including unexpected ones the route handler didn't anticipate.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error('Error:', err)

  const e = err as { status?: number; name?: string; message?: string }
  res.status(e.status ?? 500).json({
    error: e.name ?? 'InternalServerError',
    message: e.message ?? 'An unexpected error occurred',
  })
}
