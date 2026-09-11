import { createClient } from 'redis'
import { REDIS_URL } from './config'

export const redis = createClient({ url: REDIS_URL })

redis.on('error', (err) => console.error('Redis Client Error', err))

export async function connectRedis(){
    if (!redis.isOpen) {
        await redis.connect()
        console.log('Redis connected')
    }
}