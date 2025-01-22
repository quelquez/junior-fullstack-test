import express from 'express'
import cors from 'cors'
import authRouter from './routes/authRoutes.js'

const port = process.env.PORT || 8080
const app = express()

app.use(cors())
app.use(express.json())
app.use('/auth', authRouter)

app.listen(port, () => {
    console.log("Server is running.." + port)
})