import express from "express"
import cors from "cors"
import 'dotenv/config'
import cookieParser from "cookie-parser"

import connectDb from "./config/mongobd.js"

import authRouter from "./routes/authRoutes.js"

const app = express()
const port = process.env.PORT || 4000
connectDb()

app.use(express.json())
app.use(cookieParser())
app.use(cors({credentials: true}))
   app.use((req, res, next) => { console.log(req.method, req.url); next(); });

// API Endpoints
app.get('/', (req, res)=>res.send('Now 42!'))
app.use('/api/auth', authRouter)

app.listen(port, ()=> {
    console.log(process.env.MONGODB_URL);
    console.log(`Server runnin on http://localhost:${port}`)
})

