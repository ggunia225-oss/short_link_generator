import express from 'express'
import cors from 'cors'
import { urlRouter } from './routes/urlRoutes'

const expressApp = express()

expressApp.use(cors())
expressApp.use(express.json())
expressApp.use(urlRouter)

export { expressApp }