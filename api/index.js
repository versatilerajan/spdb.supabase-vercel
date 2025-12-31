import express from 'express';
import cors from 'cors';
import complaintsRouter from './complaints.js';
import adminRoutes from './admin.js';

const app = express();

// CORS
app.use(cors({
  origin: ['https://adminspdbxfe9e.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(express.json());

app.use('/complaints', complaintsRouter);
app.use('/admin', adminRoutes);

app.get('/test', (req, res) => res.send('Server is running'));

// Vercel fetch handler (Web Standard)
export default async function (req) {
  // Polyfill Express req/res from fetch Request
  const expressReq = {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    body: req.body ? await req.text() : undefined,
    json: () => JSON.parse(req.body || '{}')
  };

  // Create mock res
  let statusCode = 200;
  const headers = new Map();
  let body = '';

  const expressRes = {
    status: (code) => { statusCode = code; return expressRes; },
    set: (key, value) => headers.set(key, value),
    json: (data) => { body = JSON.stringify(data); headers.set('Content-Type', 'application/json'); },
    send: (data) => { body = data; },
    end: () => {}
  };

  // Run Express
  await app(expressReq, expressRes);

  // Return fetch Response
  return new Response(body, {
    status: statusCode,
    headers: headers
  });
}
