import { randomInt } from "node:crypto"


// Генерация короткого кода (только латиница + цифры)
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function generateShortCode(length: number = 6): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += ALPHABET[randomInt(0, ALPHABET.length)]
  }
  return result
}