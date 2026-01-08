// admin.js
import express from "express"
import { supabase } from '../lib/supabase.js'
const router = express.Router()

// Admin login
router.post("/login", (req, res) => {
  const { station, admin_id, admin_password } = req.body
  if (!station || !admin_id || !admin_password) {
    return res.status(400).json({ error: "Missing fields" })
  }
  // MAIN ADMIN
  if (station === "ALL") {
    if (
      admin_id === process.env.MAIN_ADMIN_ID &&
      admin_password === process.env.MAIN_ADMIN_PASSWORD
    ) {
      return res.json({ success: true, role: "MAIN" })
    }
    return res.status(401).json({ error: "Invalid main admin credentials" })
  }
  // STATION ADMIN
  const keyId = `ADMIN_${station.replace(/\s/g, "")}_ID`
  const keyPass = `ADMIN_${station.replace(/\s/g, "")}_PASS`
  if (
    admin_id === process.env[keyId] &&
    admin_password === process.env[keyPass]
  ) {
    return res.json({ success: true, role: "STATION", station })
  }
  res.status(401).json({ error: "Invalid station admin credentials" })
})

// Get complaints (filtered by station for station admins, all for main)
router.get("/complaints", async (req, res) => {
  const { role, station } = req.query
  if (!role || !station) {
    return res.status(401).json({ error: "Missing role or station" })
  }
  let query = supabase.from("complaints").select("*").order("created_at", { ascending: false })
  if (role === "STATION" && station) {
    // Match exact station name from frontend select values
    query = query.eq("police_station", station)
  }
  // For MAIN (station="ALL"), show all complaints
  const { data, error } = await query
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// Update complaint status (admin only) - Simplified for now; add auth as needed
router.put("/complaints/:id/status", async (req, res) => {
  const { role, station } = req.query // Use query params for consistency
  const { id } = req.params
  const { status } = req.body // status: e.g., 'In Progress', 'Resolved'
  if (!status) return res.status(400).json({ error: "Status required" })
  if (!role || !station) return res.status(401).json({ error: "Missing role or station" })
  // Validate admin access
  let query = supabase.from('complaints').select('police_station').eq('id', id).single()
  const { data: complaint, error: fetchError } = await query
  if (fetchError) return res.status(400).json({ error: fetchError.message })
  if (role === "STATION" && complaint.police_station !== station) {
    return res.status(403).json({ error: "Unauthorized to update this complaint" })
  }
  // Main admin (role="MAIN") can update any
  const { error } = await supabase
    .from('complaints')
    .update({ status })
    .eq('id', id)
  if (error) return res.status(400).json({ error: error.message })
  res.json({ message: "Status updated successfully" })
})

export default router
