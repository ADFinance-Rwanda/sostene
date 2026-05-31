import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

import { errorHandler } from './middlewares/errorHandler'
import { notFoundHandler } from './middlewares/notFoundHandler'
import routes from './routes'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

app.use('/api', routes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
