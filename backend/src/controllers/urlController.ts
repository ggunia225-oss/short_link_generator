import { Request, Response } from 'express'
import { shortenUrlSchema, shortCodeSchema } from '../schemas/urlSchemas'
import { urlService } from '../services/urlService'
import { logger } from '../lib/logger'

export const urlController = {
  // Получение короткой ссылки
  async shorten(req: Request, res: Response) {
    try {
      const result = shortenUrlSchema.safeParse(req.body)
      if (!result.success) {
        const errors = result.error.issues.map((i) => i.message).join(', ')
        return res.status(400).json({ error: errors })
      }

      const { originalUrl } = result.data
      const data = await urlService.shorten(originalUrl)
      logger.info(`Создана короткая ссылка: ${data.shortCode}`)
      return res.status(201).json(data)
    } catch (err) {
      // console.error(err)
      if (err instanceof Error) {
        if (err.message.includes('Нельзя сокращать ссылки')) {
          logger.warn(`Клиентская ошибка создания ссылки(400): ${err.message}`)
          return res.status(400).json({error: err.message})
        }
        if (err.message.includes('уникальный код')) {
          logger.error(`Ошибка создания ссылки(500): ${err.message}`)
          return res.status(500).json({ error: err.message })
        }
      }
      logger.error('Ошибка создания ссылки:', err)
      return res.status(500).json({ error: 'Внутренняя ошибка сервера' })
    }
  },

  // Редирект
  async redirect(req: Request, res: Response) {
    try {
      const result = shortCodeSchema.safeParse(req.params)
      if (!result.success) {
        return res.status(404).json({ error: 'Неверный формат короткого кода' })
      }

      const { shortCode } = result.data

      const originalUrl = await urlService.resolveShortCode(shortCode)

      if (!originalUrl) {
        return res.status(404).send('Ссылка не найдена или недоступна')
      }

      await urlService.registerClick(shortCode)
      return res.redirect(302, originalUrl)
    
    } catch (err) {
      // console.error(err)
      logger.error('Ошибка редиректа:', err)
      return res.status(500).send('Внутренняя ошибка сервера')
    }
  },

  // Получение статистики ссылки
  async stats(req: Request, res: Response) {
    try {
      const result = shortCodeSchema.safeParse(req.params)
      if (!result.success) {
        return res.status(404).json({ error: 'Невалидный код' })
      }

      const { shortCode } = result.data
      const entry = await urlService.getStats(shortCode)

      if (!entry) {
        return res.status(404).json({ error: 'Код не найден' })
      }

      return res.json({
        originalUrl: entry.original_url,
        shortCode: entry.short_code,
        clicks: entry.clicks,
        createdAt: entry.created_at,
      })
    } catch (err) {
      // console.error(err)
      logger.error('Ошибка получения статистики:', err)
      return res.status(500).json({ error: 'Внутренняя ошибка сервера' })
    }
  },
}