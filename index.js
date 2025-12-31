import express from 'express'
import { supabase } from './lib/supabase.js'

const app = express()
app.use(express.json())

app.get('/test', async (req, res) => {
    const { data, error } = await supabase.from('complaints').select('*')
    if (error) return res.status(500).json({ error })
    res.json(data)
})

app.listen(3000, () => console.log('Server running on http://localhost:3000'))
