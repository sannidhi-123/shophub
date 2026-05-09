/**
 * routes/login.js — Login + Signup API
 * POST /api/login   { email, password }
 * POST /api/signup  { name, email, password }
 *
 * Users are stored in-memory (survive server session).
 * Registered users via /api/signup are also stored here.
 */

const express = require('express');
const router = express.Router();

// In-memory user store (pre-seeded + accepts new signups)
const users = [
  { id: 1, name: 'Demo User',  email: 'user@example.com',  password: 'password123' },
  { id: 2, name: 'Admin',      email: 'admin@shophub.com', password: 'admin123'    },
];

/* POST /api/login */
router.post('/', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Email and password are required.' });

    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user)
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Login failed. Try again.' });
  }
});

/* POST /api/signup */
router.post('/signup', (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim())
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    if (!email || !email.trim())
      return res.status(400).json({ success: false, error: 'Email is required.' });
    if (!password || password.length < 6)
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });

    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists)
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });

    const newUser = { id: users.length + 1, name: name.trim(), email: email.trim().toLowerCase(), password };
    users.push(newUser);

    return res.status(201).json({
      success: true,
      message: `Account created! Welcome, ${newUser.name}!`,
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Signup failed. Try again.' });
  }
});

module.exports = router;
