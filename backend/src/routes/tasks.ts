import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth'
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from '../controllers/tasksController'

const router = Router()

router.use(authMiddleware)

router.get('/', listTasks)
router.post('/', createTask)
router.get('/:id', getTask)
router.put('/:id', updateTask)
router.delete('/:id', deleteTask)

export default router
