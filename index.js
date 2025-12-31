import express from 'express'
import complaintsRouter from './api/complaints.js'
import adminRoutes from "./api/admin.js"

const app = express()
const PORT = process.env.PORT || 3000

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
