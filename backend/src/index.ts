import express from 'express'
import cors from 'cors'
import { connectRedis, redis } from './lib/redis'
import { urlRouter } from './routes/urlRoutes'
import { logger } from './lib/logger'
import { requestLogger } from './middleware/requestLogger'


const expressApp = express()

expressApp.use(cors())
expressApp.use(express.json())
expressApp.use(urlRouter)


connectRedis().catch((err: unknown) =>
  // console.warn('Redis не подключён, работаем без кеша:', err)
  logger.warn('Redis не подключён, работаем без кеша:', err)
)

expressApp.listen(3000, () => {
  // console.info('Listening http://localhost:3000')
  logger.info('Listening http://localhost:3000')
})