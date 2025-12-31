// api/complaints.js
import express from 'express'
import { supabase } from '../lib/supabase.js'
const router = express.Router()
router.post('/', async (req, res) => {
  try {
    const {
      police_station,
      complainant_role,
      complainant_name,
      complainant_phone,
      complainant_address,
      complain_subject,
      incident_date,
      document_link
    } = req.body
    const { data, error } = await supabase
      .from('complaints')
      .insert([
        {
          police_station,
          complainant_role,
          complainant_name,
          complainant_phone,
          complainant_address,
          complain_subject,
          incident_date,
          document_link
        }
      ])

    if (error) throw error

    res.status(200).json({ message: 'Complaint added successfully', data })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('incident_date', { ascending: false }) // latest first

    if (error) throw error

    res.status(200).json(data)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

export default router
