import express from 'express'
import cors from "cors"
import complaintsRouter from './api/complaints.js'
import adminRoutes from "./api/admin.js"

const app = express()
const PORT = process.env.PORT || 3000

// Explicit CORS config for Vercel/serverless
app.use(cors({
  origin: [
    'https://adminspdbxfe9e.vercel.app',  // Your admin panel domain
    'http://localhost:3000'               // For local dev testing
  ],
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}))

// Also handle OPTIONS preflight explicitly (backup for Vercel)
app.options('*', cors())

// Middleware to parse JSON
app.use(express.json())

app.use('/complaints', complaintsRouter)
app.use("/admin", adminRoutes)

// Optional test endpoint
app.get('/test', (req, res) => {
  res.send('Server is running')
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
