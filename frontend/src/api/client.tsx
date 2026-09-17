import { extractShortCode } from '../utils/extractShortCode'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

interface ApiError {
  error?: string
}

export const shortenUrl = async (originalUrl: string) => {
  const res = await fetch(`${API_BASE}/api/shorten`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalUrl: originalUrl }),
  })
  if (!res.ok) {
    const errorData: ApiError = await res.json().catch(() => ({}))
    const message = errorData.error || 'Не удалось сократить ссылку'
    throw new Error(message)
  }
  
  return res.json() // { shortCode, shortUrl }
}

export const getStats = async (shortCode: string) => {
  const short_code = extractShortCode(shortCode)
  
  if (!short_code) {
    throw new Error('Не удалось распознать код в ссылке')
  }

  const res = await fetch(`${API_BASE}/api/stats/${short_code}`)
  
  if (!res.ok) throw new Error('Статистика не найдена')
  return res.json() // { originalUrl, shortCode, clicks, createdAt }
}