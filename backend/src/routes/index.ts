import { Router } from 'express'

import analyticsRouter from './analytics'
import meRouter from './me'
import tasksRouter from './tasks'

const router = Router()

router.use('/me', meRouter)
router.use('/tasks', tasksRouter)
router.use('/analytics', analyticsRouter)

export default router
