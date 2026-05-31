import { Request, Response, NextFunction } from 'express'

import {
  getSummary,
  getTasksByStatus,
  getTasksCreatedOverTime,
} from '../services/analyticsService'


export async function summary(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await getSummary(req.user!.id))
  } catch (err) {
    next(err)
  }
}

export async function tasksByStatus(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await getTasksByStatus(req.user!.id))
  } catch (err) {
    next(err)
  }
}

export async function tasksCreatedOverTime(req: Request, res: Response, next: NextFunction) {
  try {
    const days = req.query.days ? Math.max(1, Math.min(365, Number(req.query.days))) : 30
    res.json(await getTasksCreatedOverTime(req.user!.id, days))
  } catch (err) {
    next(err)
  }
}
