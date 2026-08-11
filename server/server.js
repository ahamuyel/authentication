import express from "express"
import cors from "cors"
import 'dotenv/config'
import cookieParser from "cookie-parser"

import connectDb from "./config/mongobd.js"

import authRouter from "./routes/authRoutes.js"

const app = express()
const port = process.env.PORT || 4200
connectDb()

app.use(express.json())
app.use(cookieParser())
app.use(cors({credentials: true}))


// API Endpoints
app.get('/', (req, res)=>res.send('API check out NOW!'))
app.use('/api/auth', authRouter)


app.listen(port, ()=> console.log(`Server runnin on http://localhost:${port}`))