import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Simple token store (in production, use JWT or proper session store)
const tokens = new Map();

export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function storeToken(token, userId) {
  tokens.set(token, { userId, createdAt: Date.now() });
}

export function removeToken(token) {
  tokens.delete(token);
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const session = tokens.get(token);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }

  // Token expires after 24 hours
  const ONE_DAY = 24 * 60 * 60 * 1000;
  if (Date.now() - session.createdAt > ONE_DAY) {
    tokens.delete(token);
    return res.status(401).json({ error: 'Unauthorized - Token expired' });
  }

  req.userId = session.userId;
  next();
}
