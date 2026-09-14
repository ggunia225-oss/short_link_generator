import request from 'supertest'
import { expressApp } from '../app'
import { prisma } from '../lib/prisma'

describe('URL Shortener API', () => {
    
    // POST /api/shorten
    describe('POST /api/shorten', () => {

        it('Создает короткую ссылку для валидного URL', async () => {
            const response = await request(expressApp)
            .post('/api/shorten')
            .send({originalUrl: 'https://example.com/very/long/url'})

            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty('shortCode')
            expect(response.body).toHaveProperty('shortUrl')
            expect(response.body.shortCode).toHaveLength(6)
            expect(response.body.shortUrl).toMatch(/^http:\/\/localhost:3000\/[A-Za-z0-9]{6}$/)
            
            // Проверяем, что запись попала в бд.
            const stored = await prisma.urls.findUnique({
                where: { short_code: response.body.shortCode },
            })
            
            expect(stored).not.toBeNull()
            expect(stored).not.toBeNull()
            expect(stored!.original_url).toBe('https://example.com/very/long/url')
        })

        it('Возвращает 400 при пустом теле', async () => {
            const response = await request(expressApp).post('/api/shorten').send({})
            
            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('error')
        })

        it('Возвращает 400 при невалидном URL', async () => {
            const response = await request(expressApp)
            .post('/api/shorten')
            .send({originalUrl: 'not-a-url'})
            
            expect(response.status).toBe(400)
            expect(response.body.error).toMatch(/Невалидная ссылка/)
        })

        it('Возвращает 400 при попытке сократить ссылку на свой сервис', async () => {
            const response = await request(expressApp)
            .post('/api/shorten')
            .send({originalUrl: 'http://localhost:3000/abc123'})

            expect(response.status).toBe(400)
            expect(response.body.error).toMatch(/Нельзя сокращать ссылки на этот же сервис/)
        })

        it('Генерирует уникальные коды для разных URL', async () => {
            const r1 = await request(expressApp)
            .post('/api/shorten')
            .send({originalUrl: 'https://example.com/1'})

            const r2 = await request(expressApp)
            .post('/api/shorten')
            .send({originalUrl: 'https://example.com/2'})
            
            expect(r1.body.shortCode).not.toBe(r2.body.shortCode)
        })
    })

    // GET /:shortCode
    describe('GET /:shortCode', () => {

        it('Редиректит на оригинальный URL и увеличивает clicks', async () => {
            await prisma.urls.create({
                data: {
                    short_code: 'abc123',
                    original_url: 'https://example.com'
                },
            })

            const response = await request(expressApp).get('/abc123')

            expect(response.status).toBe(302)
            expect(response.headers.location).toBe('https://example.com')

            const stored = await prisma.urls.findUnique({
                where: { short_code: 'abc123' },
            })

            expect(stored!.clicks).toBe(1)
        })

        it('Инкрементирует clicks при повторных переходах', async () => {
            await prisma.urls.create({
                data: {
                short_code: 'qaz789',
                original_url: 'https://example.com',
                },
            })

            await request(expressApp).get('/qaz789')
            await request(expressApp).get('/qaz789')
            await request(expressApp).get('/qaz789')

            const stored = await prisma.urls.findUnique({
                where: { short_code: 'qaz789' },
            })

            expect(stored!.clicks).toBe(3)
        })

        it('Возвращает 404 для несуществующего кода', async () => {
            const response = await request(expressApp).get('/nonex1')

            expect(response.status).toBe(404)
            expect(response.text).toMatch(/не найдена/i)
        })

        it('Возвращает 404 для невалидного формата', async () => {
            const response = await request(expressApp).get('/ab')

            expect(response.status).toBe(404)
        })
    })

    // GET /api/stats/:shortCode
    describe('GET /api/stats/:shortCode', () => {

        it('Возвращает статистику существующей ссылки', async () => {
            await prisma.urls.create({
                data: {
                short_code: 'stat01',
                original_url: 'https://example.com',
                clicks: 5,
                },
            })

            const response = await request(expressApp).get('/api/stats/stat01')

            expect(response.status).toBe(200)
            expect(response.body).toEqual({
                originalUrl: 'https://example.com',
                shortCode: 'stat01',
                clicks: 5,
                createdAt: expect.any(String),
            })
        })

        it('Возвращает 404 для несуществующего кода', async () => {
            const response = await request(expressApp).get('/api/stats/nonex1')

            expect(response.status).toBe(404)
            expect(response.body).toHaveProperty('error')
        })

        it('Возвращает 404 для невалидного формата', async () => {
            const response = await request(expressApp).get('/api/stats/ab')

            expect(response.status).toBe(404)
        })
    })

})