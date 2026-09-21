import { z } from 'zod'
import { BASE_URL } from '../lib/config'

export const shortenUrlSchema = z.object({
  originalUrl: z.string()
    .min(1, 'Ссылка не должна быть пустой')
    .refine((url) => {
        try {
            const parsed = new URL(url)
            return parsed.protocol === 'http:' || parsed.protocol === 'https:'
        } catch {
            return false
        }
    }, 'Невалидная ссылка. Должна начинаться с http:// или https://.')
   
})

export const shortCodeSchema = z.object({
  shortCode: z.string()
    .length(6, 'Код должен состоять из 6 символов')
    .regex(/^[A-Za-z0-9]+$/, 'Код должен содержать только латиницу и цифры')
})