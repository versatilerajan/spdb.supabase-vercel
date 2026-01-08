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
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  const token = authHeader.split(' ')[1]
  // In production, validate JWT or session; here assuming token contains role/station
  // For simplicity, pass role/station in a custom header or query; adjust as needed
  const { role, station } = req.query // Assume passed after login (e.g., store in session/cookie)
  let query = supabase.from("complaints").select("*").order("created_at", { ascending: false })
  if (role === "STATION" && station) {
    stationFormatted = station.replace(/([A-Z])/g, " $1").trim()
    query = query.eq("police_station", stationFormatted)
  }
  const { data, error } = await query
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// Update complaint status (admin only)
router.put("/complaints/:id/status", async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  const { id } = req.params
  const { status, station } = req.body // status: e.g., 'In Progress', 'Resolved'
  if (!status) return res.status(400).json({ error: "Status required" })
  // Validate admin access similar to login (simplified; enhance with proper auth)
  if (station === "ALL") {
    // Main admin can update any
  } else {
    // Station admin can only update their station's complaints
    const { data: complaint } = await supabase.from('complaints').select('police_station').eq('id', id).single()
    if (complaint.police_station !== station.replace(/([A-Z])/g, " $1").trim()) {
      return res.status(403).json({ error: "Unauthorized to update this complaint" })
    }
  }
  const { error } = await supabase
    .from('complaints')
    .update({ status })
    .eq('id', id)
  if (error) return res.status(400).json({ error: error.message })
  res.json({ message: "Status updated successfully" })
})

export default router
