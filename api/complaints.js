import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === "POST") {
    const {
      police_station,
      complainant_role,
      complainant_name,
      complainant_phone,
      complainant_address,
      complaint_subject,
      incident_date,
      document_link
    } = req.body;

    if (!police_station || !complainant_name || !incident_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("complaints")
      .insert([{
        police_station,
        complainant_role,
        complainant_name,
        complainant_phone,
        complainant_address,
        complaint_subject,
        incident_date,
        document_link
      }]);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  res.status(405).json({ error: "Method not allowed" });
}
