import { expressApp } from "./app";
import { connectRedis } from "./lib/redis";
import { logger } from './lib/logger'

connectRedis().catch((err: unknown) =>
  // console.warn('Redis не подключён, работаем без кеша:', err)
  logger.warn('Redis не подключён, работаем без кеша:', err)
)

expressApp.listen(3000, () => {
  // console.info('Listening http://localhost:3000')
  logger.info('Listening http://localhost:3000')
})