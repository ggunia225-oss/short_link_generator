const API_BASE = 'http://localhost:3000'
// const API_BASE = ''

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
  const res = await fetch(`${API_BASE}/api/stats/${shortCode}`)
  if (!res.ok) throw new Error('Статистика не найдена')
  return res.json() // { originalUrl, shortCode, clicks, createdAt }
}