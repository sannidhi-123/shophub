/**
 * middleware/auth.js — Token auth using Node.js built-in crypto only
 */
const crypto = require('crypto');
const SECRET = process.env.JWT_SECRET || 'shophub_super_secret_2024';

function createToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body   = Buffer.from(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 7*24*60*60*1000 })).toString('base64url');
  const sig    = crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

function verifyToken(token) {
  const parts = (token || '').split('.');
  if (parts.length !== 3) throw new Error('Invalid token');
  const [header, body, sig] = parts;
  const expected = crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url');
  if (sig !== expected) throw new Error('Invalid signature');
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
  if (payload.exp < Date.now()) throw new Error('Token expired');
  return payload;
}

function authenticateToken(req, res, next) {
  const token = (req.headers['authorization'] || '').split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'Please login first.' });
  try { req.user = verifyToken(token); next(); }
  catch { res.status(403).json({ success: false, error: 'Session expired. Please login again.' }); }
}

module.exports = { createToken, verifyToken, authenticateToken };
