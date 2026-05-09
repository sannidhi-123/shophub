/**
 * controllers/authController.js
 * Auth using ONLY Node.js built-in crypto (no bcryptjs/jsonwebtoken/uuid needed)
 * 
 * Passwords: PBKDF2-SHA512 with random salt  →  "salt:hash" stored in users.json
 * Tokens:    HMAC-SHA256 signed JWT-style
 * IDs:       crypto.randomUUID()
 */
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const { createToken } = require('../middleware/auth');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

/* ── Password helpers ── */
function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plain, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function checkPassword(plain, stored) {
  try {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const attempt = crypto.pbkdf2Sync(plain, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(attempt, 'hex'));
  } catch { return false; }
}

/* ── File helpers ── */
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8')); }
  catch { return []; }
}
function saveUsers(u) { fs.writeFileSync(USERS_FILE, JSON.stringify(u, null, 2)); }
function safeUser(u)  { const { password, ...s } = u; return s; }

/* ── Validation ── */
function isEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || '')); }

/* ══════════════════════════════
   POST /api/auth/signup
══════════════════════════════ */
function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !String(name).trim()) return res.status(400).json({ success:false, error:'Full name is required.' });
    if (!isEmail(email))               return res.status(400).json({ success:false, error:'Enter a valid email address.' });
    if (!password || password.length < 6) return res.status(400).json({ success:false, error:'Password must be at least 6 characters.' });

    const users = readUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
      return res.status(409).json({ success:false, error:'An account with this email already exists. Please sign in.' });

    const newUser = {
      id:             crypto.randomUUID(),
      name:           String(name).trim(),
      email:          String(email).trim().toLowerCase(),
      password:       hashPassword(String(password)),
      avatar:         `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(String(name).trim())}`,
      wishlist:       [],
      recentlyViewed: [],
      stylePrefs:     [],
      createdAt:      new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const token = createToken({ id:newUser.id, name:newUser.name, email:newUser.email });
    console.log(`✅ Signup: ${newUser.name} (${newUser.email})`);
    return res.status(201).json({ success:true, message:`Welcome to ShopHub, ${newUser.name}! 🎉`, token, user:safeUser(newUser) });
  } catch(err) {
    console.error('Signup error:', err);
    res.status(500).json({ success:false, error:'Signup failed. Please try again.' });
  }
}

/* ══════════════════════════════
   POST /api/auth/login
══════════════════════════════ */
function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success:false, error:'Email and password are required.' });
    if (!isEmail(email))     return res.status(400).json({ success:false, error:'Enter a valid email address.' });

    const users = readUsers();
    const user  = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
    if (!user)                        return res.status(401).json({ success:false, error:'No account found with this email.' });
    if (!checkPassword(String(password), user.password))
      return res.status(401).json({ success:false, error:'Incorrect password. Try again.' });

    const token = createToken({ id:user.id, name:user.name, email:user.email });
    console.log(`✅ Login: ${user.name} (${user.email})`);
    return res.json({ success:true, message:`Welcome back, ${user.name}! 👋`, token, user:safeUser(user) });
  } catch(err) {
    console.error('Login error:', err);
    res.status(500).json({ success:false, error:'Login failed. Please try again.' });
  }
}

/* ══════════════════════════════
   GET /api/auth/me
══════════════════════════════ */
function getMe(req, res) {
  const u = readUsers().find(u => u.id === req.user.id);
  if (!u) return res.status(404).json({ success:false, error:'User not found.' });
  res.json({ success:true, user:safeUser(u) });
}

/* ══════════════════════════════
   PUT /api/auth/profile
══════════════════════════════ */
function updateProfile(req, res) {
  const { name, stylePrefs } = req.body;
  const users = readUsers();
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ success:false, error:'User not found.' });
  if (name && String(name).trim()) {
    users[idx].name   = String(name).trim();
    users[idx].avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(users[idx].name)}`;
  }
  if (Array.isArray(stylePrefs)) users[idx].stylePrefs = stylePrefs;
  saveUsers(users);
  res.json({ success:true, message:'Profile updated!', user:safeUser(users[idx]) });
}

/* ══════════════════════════════
   POST /api/auth/wishlist/:id
══════════════════════════════ */
function toggleWishlist(req, res) {
  const users = readUsers();
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ success:false, error:'User not found.' });
  const pid = parseInt(req.params.productId);
  const list = users[idx].wishlist || [];
  const inList = list.includes(pid);
  users[idx].wishlist = inList ? list.filter(x => x !== pid) : [...list, pid];
  saveUsers(users);
  res.json({ success:true, added:!inList, wishlist:users[idx].wishlist, message: inList ? 'Removed from wishlist' : 'Added to wishlist ❤️' });
}

/* ══════════════════════════════
   POST /api/auth/recently-viewed/:id
══════════════════════════════ */
function addRecentlyViewed(req, res) {
  try {
    const users = readUsers();
    const idx = users.findIndex(u => u.id === req.user.id);
    if (idx === -1) return res.status(200).json({ success:true });
    const pid = parseInt(req.params.productId);
    users[idx].recentlyViewed = [pid, ...(users[idx].recentlyViewed||[]).filter(x=>x!==pid)].slice(0,12);
    saveUsers(users);
    res.json({ success:true });
  } catch { res.status(200).json({ success:true }); }
}

module.exports = { signup, login, getMe, updateProfile, toggleWishlist, addRecentlyViewed };
