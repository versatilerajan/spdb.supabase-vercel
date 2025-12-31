import express from "express"
const router = express.Router()

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

export default router
