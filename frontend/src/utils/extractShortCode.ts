/**
 * Извлекает короткий код из любого ввода:
 * - "abc123"                          → "abc123"
 * - "http://localhost:3000/abc123"    → "abc123"
 * - "localhost:3000/abc123"           → "abc123"
 * - "/abc123"                         → "abc123"
 * - " abc123 "                        → "abc123"
 * - "https://site.ru/abc123?foo=bar"  → "abc123"
 * - "localhost:3000"                  → null
 * - "mailto:foo@bar.com"              → null
 */
export function extractShortCode(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  let lastSegment = ''

  // Полноценный URL — только если есть http/https.
  // Иначе "localhost:3000" парсится как схема "localhost:" с pathname "3000".
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      lastSegment = new URL(trimmed).pathname.split('/').filter(Boolean).pop() ?? ''
    } catch {
      // не URL — прордолжаем
    }
  }

  if (!lastSegment) {
    const withoutQuery = trimmed.split(/[?#]/)[0]
    lastSegment = withoutQuery.split('/').filter(Boolean).pop() ?? ''
  }

  // Код состоит только из букв и цифр — иначе это не код.
  return /^[A-Za-z0-9]+$/.test(lastSegment) ? lastSegment : null

}