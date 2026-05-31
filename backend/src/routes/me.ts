import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middlewares/auth'

const router = Router()

router.get('/', authMiddleware, (req: Request, res: Response) => {
  res.json(req.user)
})

export default router
