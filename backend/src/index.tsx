import express from 'express'
import { randomBytes } from 'crypto'
import cors from 'cors'
import { z } from 'zod'

const expressApp = express()
expressApp.use(cors())
expressApp.use(express.json())

// Генерация короткого кода (только латиница + цифры)
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

function generateShortCode(length: number = 6): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return result
}

const urlStats = new Map<string,{
    originalUrl: string
    shortCode: string
    clicks: number
    createdAt: string
}>()

const shortenUrlSchema = z.object({
  originalUrl: z.string()
    .min(1, 'Ссылка не должна быть пустой')
    .refine((url) => {
        try {
            const parsed = new URL(url)
            return parsed.protocol === 'http:' || parsed.protocol === 'https:'
        } catch {
            return false
        }
    }, 'Невалидная ссылка. Должна начинаться с http:// или https://')
})

// Создание короткой ссылки
expressApp.post('/api/shorten', (req, res) => {
    const result = shortenUrlSchema.safeParse(req.body)

    if (!result.success) {
        const errors = result.error.issues.map(issue => issue.message).join(', ')
        return res.status(400).json({ error: errors })
    }

    const { originalUrl } = result.data

    let shortCode: string
    let isUnique = false
    let attempts = 0

    do {
        shortCode = generateShortCode(6)
        attempts++
        if (attempts > 10) {
            return res.status(500).json({error: 'Не удалось сгенерировать уникальный код'})
        }
        if (!urlStats.has(shortCode)) isUnique = true
    } while (!isUnique)

    urlStats.set(shortCode, {
        originalUrl,
        shortCode,
        clicks: 0,
        createdAt: new Date().toISOString(),
    })

    res.status(201).json({
        shortCode,
        shortUrl: `http://localhost:3000/${shortCode}`
    })
})

const shortCodeSchema = z.object({
  shortCode: z.string()
    .length(6, 'Код должен состоять из 6 символов')
    .regex(/^[A-Za-z0-9]+$/, 'Код должен содержать только латиницу и цифры')
})

// Редирект и увеличение счетчика
expressApp.get('/:shortCode', (req, res) => {
    const result = shortCodeSchema.safeParse(req.params)
    if (!result.success) {
        return res.status(400).json({error: 'неверный формат короткого кода'})
    }
    
    const { shortCode } = result.data
    const entry = urlStats.get(shortCode)
    
    if (!entry) {
        return res.status(404).send('Ссылка не найдена')
    }

    entry.clicks += 1
    urlStats.set(shortCode, entry)
    
    res.redirect(302, entry.originalUrl)
})


// Статистика ссылки
expressApp.get('/api/stats/:shortCode', (req, res) => {
    const { shortCode } = req.params
    const entry = urlStats.get(shortCode)
    if (!entry){
        return res.status(404).json({error: 'Ссылка не найдена'})
    }
    res.json({
        originalUrl: entry.originalUrl,
        shortCode: entry.shortCode,
        clicks: entry.clicks,
        createdAt: entry.createdAt,
    })
    
})

expressApp.listen(3000, () => {
    console.info('Listening http://localhost:3000')
})