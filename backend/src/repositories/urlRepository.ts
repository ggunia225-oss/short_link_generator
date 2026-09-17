import { prisma } from '../lib/prisma'

export const urlRepository = {
  async findByShortCode(short_code: string) {
    return prisma.urls.findUnique({ where: { short_code } })
  },

  async findByOriginalUrl(original_url: string) {
    return prisma.urls.findFirst({ where: { original_url } })
  },

  async create(short_code: string, original_url: string) {
    return prisma.urls.create({
      data: { short_code, original_url },
    })
  },

  async incrementClicks(short_code: string) {
    return prisma.urls.update({
      where: { short_code },
      data: { clicks: { increment: 1 } },
    })
  },
}