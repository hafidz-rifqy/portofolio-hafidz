import { Router } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import db from '../db.js';
import { authMiddleware, generateToken, storeToken, removeToken } from '../middleware/auth.js';
import { broadcast } from '../sse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Setup multer for file uploads
const uploadDir = process.env.UPLOAD_DIR || join(__dirname, '..', '..', 'public', 'uploads');
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf'];
    const ext = extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

// POST /api/admin/login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken();
    storeToken(token, user.id);
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/logout
router.post('/logout', authMiddleware, (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  removeToken(token);
  res.json({ success: true });
});

// PUT /api/admin/profile
router.put('/profile', authMiddleware, upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'cv_file', maxCount: 1 }
]), (req, res) => {
  try {
    const { name, title, subtitle, bio, email } = req.body;
    let photo = req.body.existing_photo || '';
    let cv_file = req.body.existing_cv || '';

    if (req.files && req.files.photo) {
      photo = '/uploads/' + req.files.photo[0].filename;
    }
    if (req.files && req.files.cv_file) {
      cv_file = '/uploads/' + req.files.cv_file[0].filename;
    }

    db.prepare(`
      UPDATE profile SET name = ?, title = ?, subtitle = ?, bio = ?, email = ?, photo = ?, cv_file = ?
      WHERE id = 1
    `).run(name, title, subtitle, bio, email, photo, cv_file);

    const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/portfolio
router.post('/portfolio', authMiddleware, upload.single('image'), (req, res) => {
  try {
    const { category, title, description, detail, tech_used, duration, site_url, sort_order } = req.body;
    const image = req.file ? '/uploads/' + req.file.filename : '';

    const result = db.prepare(`
      INSERT INTO portfolio (category, title, description, detail, image, tech_used, duration, site_url, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(category, title, description || '', detail || '', image, tech_used || '', duration || '', site_url || '', sort_order || 0);

    const item = db.prepare('SELECT * FROM portfolio WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/portfolio/:id
router.put('/portfolio/:id', authMiddleware, upload.single('image'), (req, res) => {
  try {
    const { category, title, description, detail, tech_used, duration, site_url, sort_order } = req.body;
    let image = req.body.existing_image || '';
    if (req.file) {
      image = '/uploads/' + req.file.filename;
    }

    db.prepare(`
      UPDATE portfolio SET category = ?, title = ?, description = ?, detail = ?, image = ?, tech_used = ?, duration = ?, site_url = ?, sort_order = ?
      WHERE id = ?
    `).run(category, title, description || '', detail || '', image, tech_used || '', duration || '', site_url || '', sort_order || 0, req.params.id);

    const item = db.prepare('SELECT * FROM portfolio WHERE id = ?').get(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/portfolio/:id
router.delete('/portfolio/:id', authMiddleware, (req, res) => {
  try {
    db.prepare('DELETE FROM portfolio WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/experience
router.post('/experience', authMiddleware, (req, res) => {
  try {
    const { title, institution, period, description, type, sort_order } = req.body;
    const result = db.prepare(`
      INSERT INTO experience (title, institution, period, description, type, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, institution || '', period || '', description || '', type || 'education', sort_order || 0);

    const item = db.prepare('SELECT * FROM experience WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/experience/:id
router.put('/experience/:id', authMiddleware, (req, res) => {
  try {
    const { title, institution, period, description, type, sort_order } = req.body;
    db.prepare(`
      UPDATE experience SET title = ?, institution = ?, period = ?, description = ?, type = ?, sort_order = ?
      WHERE id = ?
    `).run(title, institution || '', period || '', description || '', type || 'education', sort_order || 0, req.params.id);

    const item = db.prepare('SELECT * FROM experience WHERE id = ?').get(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/experience/:id
router.delete('/experience/:id', authMiddleware, (req, res) => {
  try {
    db.prepare('DELETE FROM experience WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CRUD Social Links
router.post('/social', authMiddleware, (req, res) => {
  try {
    const { platform, url, icon, sort_order } = req.body;
    const result = db.prepare('INSERT INTO social_links (platform, url, icon, sort_order) VALUES (?, ?, ?, ?)').run(platform, url, icon || platform, sort_order || 0);
    const item = db.prepare('SELECT * FROM social_links WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/social/:id', authMiddleware, (req, res) => {
  try {
    const { platform, url, icon, sort_order } = req.body;
    db.prepare('UPDATE social_links SET platform = ?, url = ?, icon = ?, sort_order = ? WHERE id = ?').run(platform, url, icon || platform, sort_order || 0, req.params.id);
    const item = db.prepare('SELECT * FROM social_links WHERE id = ?').get(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/social/:id', authMiddleware, (req, res) => {
  try {
    db.prepare('DELETE FROM social_links WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Comments moderation
router.get('/comments', authMiddleware, (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM comments ORDER BY created_at DESC').all();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/comments/:id', authMiddleware, (req, res) => {
  try {
    db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
    broadcast('delete-comment', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Contact messages
router.get('/contacts', authMiddleware, (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/contacts/:id/read', authMiddleware, (req, res) => {
  try {
    db.prepare('UPDATE contacts SET is_read = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/contacts/:id', authMiddleware, (req, res) => {
  try {
    db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change password
router.put('/password', authMiddleware, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.userId);

    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashed = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE admin_users SET password = ? WHERE id = ?').run(hashed, req.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
