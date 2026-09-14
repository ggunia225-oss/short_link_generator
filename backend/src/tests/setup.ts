import { config } from "dotenv"
import path from 'path'
config({ path: path.resolve(__dirname, '../../.env.test')})

jest.mock('../lib/redis', () => ({
    redis: {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('ОК'),
    },
    connectRedis: jest.fn().mockResolvedValue(undefined),
}))

import { prisma } from "../lib/prisma"

beforeEach(async () => {
    await prisma.urls.deleteMany({})
})

afterAll(async () => {
    await prisma.$disconnect()
})