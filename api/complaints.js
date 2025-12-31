import express from 'express'
import { supabase } from '../lib/supabase.js'

const router = express.Router()

// 🔐 Simple admin check middleware
const isAdmin = (req, res, next) => {
  const adminKey = req.headers['x-admin-key']

  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ error: 'Unauthorized: Admin access required' })
  }

  next()
}
router.post('/', async (req, res) => {
  try {
    const {
      police_station,
      complainant_role,
      complainant_name,
      complainant_phone,
      complainant_address,
      complaint_subject,
      complaint_details,
      incident_date,
      document_link
    } = req.body

    const { data, error } = await supabase
      .from('complaints')
      .insert([{
        police_station,
        complainant_role,
        complainant_name,
        complainant_phone,
        complainant_address,
        complaint_subject,
        complaint_details,
        incident_date,
        document_link
      }])

    if (error) throw error

    res.status(201).json({ message: 'Complaint added successfully', data })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// GET all complaints
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('incident_date', { ascending: false })

    if (error) throw error

    res.status(200).json(data)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('complaints')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.status(200).json({ message: 'Complaint deleted successfully' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

export default router
