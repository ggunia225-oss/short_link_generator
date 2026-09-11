// const API_BASE = 'http://localhost:3000'
const API_BASE = ''

export const shortenUrl = async (original_url: string) => {
  const res = await fetch(`${API_BASE}/api/shorten`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ original_url }),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const message = errorData.error || 'Не удалось сократить ссылку'
    throw new Error(message)
  }
  
  return res.json() // { shortCode, shortUrl }
}

export const getStats = async (short_code: string) => {
  const res = await fetch(`${API_BASE}/api/stats/${short_code}`)
  if (!res.ok) throw new Error('Статистика не найдена')
  return res.json() // { originalUrl, shortCode, clicks, createdAt }
}