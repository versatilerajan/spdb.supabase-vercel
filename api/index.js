import express from 'express';
import cors from 'cors';
import complaintsRouter from './complaints.js';
import adminRoutes from './admin.js';

const app = express();

// CORS (your original, explicit for admin panel)
app.use(cors({
  origin: [
    'https://adminspdbxfe9e.vercel.app',  // Your admin panel
    'http://localhost:3000'               // Local dev
  ],
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// Handle preflight
app.options('*', cors());

// JSON parsing
app.use(express.json());

// Your routes (no changes)
app.use('/complaints', complaintsRouter);
app.use('/admin', adminRoutes);

// Root/test (optional, for / and /test)
app.get('/', (req, res) => {
  res.json({ message: 'Police Complaint API Ready' });
});
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Export for Vercel (no listen()—fixes crashes)
export default app;
