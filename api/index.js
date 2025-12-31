import express from 'express';
import cors from 'cors';
import complaintsRouter from '../api/complaints.js';  // Adjust path if needed (relative to /api)
import adminRoutes from '../api/admin.js';  // Adjust path if needed

const app = express();

// Explicit CORS for your admin panel
app.use(cors({
  origin: [
    'https://adminspdbxfe9e.vercel.app',  // Admin panel
    'http://localhost:3000'  // Local dev
  ],
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// Handle preflight OPTIONS
app.options('*', cors());

// Parse JSON
app.use(express.json());

app.use('/complaints', complaintsRouter);
app.use('/admin', adminRoutes);

// Test endpoint
app.get('/test', (req, res) => {
  res.send('Server is running');
});

// Export for Vercel serverless (no listen in prod)
export default app;
