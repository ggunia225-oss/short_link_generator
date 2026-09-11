import 'dotenv/config'

export const DB_USER = process.env.DB_USER || 'postgres'
export const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres'
export const DB_NAME = process.env.DB_NAME || 'web_tz'
export const DB_HOST = process.env.DB_HOST || 'localhost'
export const DB_PORT = process.env.DB_PORT || '5432'
export const DB_SCHEMA = process.env.DB_SCHEMA || 'public'

export const DATABASE_URL =
  `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=${DB_SCHEMA}`

export const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
export const REDIS_PORT = process.env.REDIS_PORT || '6379'
export const REDIS_URL = `redis://${REDIS_HOST}:${REDIS_PORT}`