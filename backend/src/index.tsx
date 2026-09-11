import express from 'express'
import { randomBytes } from 'crypto'
import cors from 'cors'
import { z } from 'zod'
import { prisma } from './lib/prisma'

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

const shortenUrlSchema = z.object({
  original_url: z.string()
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

const shortCodeSchema = z.object({
  short_code: z.string()
    .length(6, 'Код должен состоять из 6 символов')
    .regex(/^[A-Za-z0-9]+$/, 'Код должен содержать только латиницу и цифры')
})

// Создание короткой ссылки
expressApp.post('/api/shorten', async (req, res) => {
    try {
        const result = shortenUrlSchema.safeParse(req.body)

        if (!result.success) {
            const errors = result.error.issues.map(issue => issue.message).join(', ')
            return res.status(400).json({ error: errors })
    }
    
    const { original_url } = result.data

    let short_code: string
    // let isUnique = false
    let attempts = 0
    while (true) {
        short_code = generateShortCode(6)
        attempts++
        if (attempts > 10) {
            return res.status(500).json({error: 'Не удалось сгенерировать уникальный код'})
        }
        const existing = await prisma.urls.findUnique({where: { short_code }})
        if (!existing) break
    }

    const created = await prisma.urls.create({
        data: { short_code, original_url },
    })

    res.status(201).json({
        shortCode: created.short_code,
        shortUrl: `http://localhost:3000/${created.short_code}`,
    })
    
    } catch (err) {
        console.error(err)
        res.status(500).json({error:'Внутренняя ошибка сервера'})
    }
    
})



// Редирект и увеличение счетчика
expressApp.get('/:short_code', async (req, res) => {
    try {
        const result = shortCodeSchema.safeParse(req.params)    
        
        if (!result.success) {
            return res.status(400).json({error: 'неверный формат короткого кода'})
        }

        const { short_code } = result.data

        const entry = await prisma.urls.update({
            where: {short_code},
            data: {clicks: {increment: 1}},
        }).catch(() => null)

        if (!entry) {
            return res.status(404).send('Ссылка не найдена')
        }

        res.redirect(302, entry.original_url)
    } catch (err) {
        console.error(err)
        res.status(500).send('Внутренняя ошибка сервера')
    }

})


// Статистика ссылки
expressApp.get('/api/stats/:short_code', async (req, res) => {
    try {
        const result = shortCodeSchema.safeParse(req.params)
        if (!result.success) {
            return res.status(400).json({error: 'Неверный формат короткого кода'})
        }

        const { short_code } = result.data

        const entry = await prisma.urls.findUnique({where: { short_code }})
        if (!entry){
            return res.status(404).json({error: 'Ссылка не найдена'})
        }

        res.json({
            originalUrl: entry.original_url,
            shortCode: entry.short_code,
            clicks: entry.clicks,
            createdAt: entry.created_at,
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Внутренняя ошибка сервера'})
    }
    
})

expressApp.listen(3000, () => {
    console.info('Listening http://localhost:3000')
})