import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import apiRoutes from './routes/api.js';
import adminRoutes from './routes/admin.js';
import { addClient } from './sse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files - serve uploads
app.use('/uploads', express.static(join(__dirname, '..', 'public', 'uploads')));

// SSE endpoint for real-time updates
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.write(':\n\n'); // heartbeat
  addClient(res);
});

// API Routes
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

// Serve Static Frontend (Vite Build)
const distPath = join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Fallback for admin panel
app.get('/admin*', (req, res) => {
  res.sendFile(join(distPath, 'admin', 'index.html'));
});

// Fallback for frontend (public)
app.get('*', (req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✨ Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
