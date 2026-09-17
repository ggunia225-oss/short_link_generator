import { redis } from '../lib/redis'
import { urlRepository } from '../repositories/urlRepository'
import { generateShortCode } from '../utils/generateShortCode'
import { BASE_URL } from '../lib/config'
import { logger } from '../lib/logger'

const MAX_ATTEMPTS = 10
const CACHE_TTL = 3600   // 1 час

function isSelfRedirect(url: string): boolean {
  try {
    return new URL(url).host === new URL(BASE_URL).host
  } catch {
    return false
  }
}

export const urlService = {
  
  async shorten(originalUrl: string) {
    let short_code: string
    let attempts = 0

    while (true) {
      short_code = generateShortCode(6)
      attempts++
      if (attempts > MAX_ATTEMPTS) {
        throw new Error('Не удалось сгенерировать уникальный код')
      }
      const existing = await urlRepository.findByShortCode(short_code)
      if (!existing) break
    }

    const created = await urlRepository.create(short_code, originalUrl)
    return {
      shortCode: created.short_code,
      shortUrl: `${BASE_URL}/${created.short_code}`,
    }
  },

  async resolveShortCode(short_code: string): Promise<string | null> {
    const cacheKey = `short:${short_code}`
    let original_url: string | null = null

    // 1. Пытаемся получить из кеша
    try {
      original_url = await redis.get(cacheKey)
      if (original_url) {
        // console.log(`Извлекаем из кэша: ${short_code}`)
        logger.debug(`Попытка извлечения из кэша: ${short_code}`)
        if (isSelfRedirect(original_url)) {
          // console.warn(`Циклический редирект обнаружен для ${short_code}`)
          logger.warn(`Циклический редирект обнаружен для ${short_code}`)
          return null
        }
        return original_url
      }
    } catch {
      // console.warn('Redis недоступен (get)')
      logger.warn('Redis недоступен (get)')
    }

    // 2. Получаем из БД
    const entry = await urlRepository.findByShortCode(short_code)
    if (!entry) return null

    original_url = entry.original_url

    if (isSelfRedirect(original_url)) {
      // console.warn(`Циклический редирект обнаружен для ${short_code}`)
      logger.warn(`Циклический редирект обнаружен для ${short_code}`)
      return null
    }

    // 3. Кешируем результат
    try {
      await redis.set(cacheKey, original_url, { EX: CACHE_TTL })
    } catch {
      // console.warn('Redis недоступен (set)')
      logger.warn('Redis недоступен (set)')
    }

    return original_url
  },

  async getStats(short_code: string) {
    return urlRepository.findByShortCode(short_code)
  },

  async registerClick(short_code: string) {
    try {
      await urlRepository.incrementClicks(short_code)
    } catch (err: unknown) {
      logger.error(`Ошибка инкремента кликов для ${short_code}`, err)
    }
    
  },
}