import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';  // Inline Supabase—no lib file needed

const app = express();

// CORS
app.use(cors({
  origin: ['https://adminspdbxfe9e.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(express.json());

// Root route (fixes 500 on /)
app.get('/', (req, res) => {
  res.json({ message: 'Police Complaint API Ready (Vercel 2025)' });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Admin login (inline)
app.post('/admin/login', (req, res) => {
  const { station, admin_id, admin_password } = req.body;
  if (!station || !admin_id || !admin_password) {
    return res.status(400).json({ error: "Missing fields" });
  }
  // MAIN ADMIN
  if (station === "ALL") {
    if (admin_id === process.env.MAIN_ADMIN_ID && admin_password === process.env.MAIN_ADMIN_PASSWORD) {
      return res.json({ success: true, role: "MAIN" });
    }
    return res.status(401).json({ error: "Invalid main admin credentials" });
  }
  // STATION ADMIN
  const keyId = `ADMIN_${station.replace(/\s/g, "")}_ID`;
  const keyPass = `ADMIN_${station.replace(/\s/g, "")}_PASS`;
  if (admin_id === process.env[keyId] && admin_password === process.env[keyPass]) {
    return res.json({ success: true, role: "STATION", station });
  }
  res.status(401).json({ error: "Invalid station admin credentials" });
});

// Complaints GET (inline, with Supabase)
app.get('/complaints', async (req, res) => {
  let { station } = req.query;
  try {
    // Inline Supabase client (avoids import crashes)
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: "Supabase config missing" });
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });
    let query = supabase.from("complaints").select("*");
    if (station && station !== "ALL") {
      station = station.replace(/([A-Z])/g, " $1").trim();
      query = query.eq("police_station", station);
    }
    const { data, error } = await query.order("incident_date", { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    console.error('Supabase error:', err);  // Logs to Vercel
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

// Complaints POST (inline, if needed for future)
app.post('/complaints', async (req, res) => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: "Supabase config missing" });
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });
    const { data, error } = await supabase
      .from('complaints')
      .insert([req.body])
      .select();
    if (error) throw error;
    res.status(201).json({ message: 'Complaint added', data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Vercel 2025 handler (wraps Express for serverless—no 500!)
export default async function handler(req) {
  return new Promise((resolve) => {
    // Convert fetch Request to Express req/res
    const { method, url, headers, body } = req;
    const nodeUrl = new URL(url || '/', 'http://localhost');
    const expressReq = {
      method,
      url: nodeUrl.pathname + nodeUrl.search,
      headers: Object.fromEntries(headers.entries()),
      query: Object.fromEntries(nodeUrl.searchParams),
      body: method !== 'GET' && body ? await body.text() : undefined
    };

    let status = 200;
    const resHeaders = {};
    let bodyStr = '';

    const expressRes = {
      statusCode: status,
      status: (code) => { status = code; return expressRes; },
      setHeader: (key, value) => { resHeaders[key] = value; return expressRes; },
      json: (data) => {
        bodyStr = JSON.stringify(data);
        resHeaders['Content-Type'] = 'application/json';
      },
      send: (data) => {
        bodyStr = data.toString();
        if (typeof data === 'object') resHeaders['Content-Type'] = 'application/json';
      },
      end: () => resolve(new Response(bodyStr, { status, headers: resHeaders }))
    };

    // Parse JSON body if POST
    if (expressReq.body && method === 'POST') {
      try {
        expressReq.body = JSON.parse(expressReq.body);
      } catch (e) {
        expressRes.status(400).json({ error: 'Invalid JSON' }).end();
        return;
      }
    }

    // Run Express
    app(expressReq, expressRes);
  });
}
