/**
 * Извлекает короткий код из любого ввода:
 * - "abc123"                          → "abc123"
 * - "http://localhost:3000/abc123"    → "abc123"
 * - "localhost:3000/abc123"           → "abc123"
 * - "/abc123"                         → "abc123"
 * - " abc123 "                        → "abc123"
 * - "https://site.ru/abc123?foo=bar"  → "abc123"
 */
export function extractShortCode(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''

  // Пытаемся распарсить как URL (если есть протокол)
  try {
    const url = new URL(trimmed)
    const lastSegment = url.pathname.split('/').filter(Boolean).pop() ?? ''
    return lastSegment
  } catch {
    // Не URL — продолжаем
  }

  // Убираем query-строку и hash вручную: "abc123?foo" → "abc123"
  const withoutQuery = trimmed.split(/[?#]/)[0]

  // Берём последний сегмент пути: "localhost:3000/abc123" → "abc123"
  const lastSegment = withoutQuery.split('/').filter(Boolean).pop() ?? ''

  // Оставляем только буквы и цифры на всякий случай
  return lastSegment.replace(/[^A-Za-z0-9]/g, '')
}