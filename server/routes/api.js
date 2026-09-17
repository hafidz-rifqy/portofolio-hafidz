import { Router } from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import db from '../db.js';
import { broadcast } from '../sse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadDir = join(__dirname, '..', '..', 'public', 'uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for avatars
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed for avatar'));
    }
  }
});

const router = Router();

// GET /api/profile
router.get('/profile', (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get();
    res.json(profile || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/portfolio?category=project
router.get('/portfolio', (req, res) => {
  try {
    const { category } = req.query;
    let items;
    if (category) {
      items = db.prepare('SELECT * FROM portfolio WHERE category = ? ORDER BY sort_order ASC').all(category);
    } else {
      items = db.prepare('SELECT * FROM portfolio ORDER BY category, sort_order ASC').all();
    }
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/experience
router.get('/experience', (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM experience ORDER BY sort_order ASC').all();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/social
router.get('/social', (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM social_links ORDER BY sort_order ASC').all();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/comments
router.get('/comments', (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM comments WHERE is_approved = 1 ORDER BY created_at DESC LIMIT 50').all();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/comments
router.post('/comments', upload.single('avatar_image'), (req, res) => {
  try {
    const { name, message, avatar_color } = req.body;
    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required' });
    }
    if (name.length > 100 || message.length > 1000) {
      return res.status(400).json({ error: 'Name or message too long' });
    }

    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];
    const finalColor = avatar_color || colors[Math.floor(Math.random() * colors.length)];
    const avatarImage = req.file ? '/uploads/' + req.file.filename : '';

    const result = db.prepare('INSERT INTO comments (name, message, avatar_color, avatar_image) VALUES (?, ?, ?, ?)').run(name, message, finalColor, avatarImage);
    const newComment = db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid);
    
    // Broadcast to admin panel
    broadcast('new-comment', newComment);
    
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/contact
router.post('/contact', (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = db.prepare('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)').run(name, email, message);
    const newContact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(result.lastInsertRowid);
    
    // Broadcast to admin panel
    broadcast('new-contact', newContact);
    
    res.status(201).json({ success: true, message: 'Pesan berhasil dikirim!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
