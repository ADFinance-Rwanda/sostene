import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth'
import {
  summary,
  tasksByStatus,
  tasksCreatedOverTime,
} from '../controllers/analyticsController'

const router = Router()

router.use(authMiddleware)

router.get('/summary', summary)
router.get('/tasks-by-status', tasksByStatus)
router.get('/tasks-created-over-time', tasksCreatedOverTime)

export default router
