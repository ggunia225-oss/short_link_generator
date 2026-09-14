import { Router } from 'express'
import { urlController } from '../controllers/urlController'

export const urlRouter = Router()

urlRouter.post('/api/shorten', urlController.shorten)
urlRouter.get('/api/stats/:shortCode', urlController.stats)
urlRouter.get('/:shortCode', urlController.redirect)

