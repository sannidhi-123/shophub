/**
 * server.js — ShopHub v3.0
 *
 * ZERO external auth dependencies.
 * Uses only: express, cors, Node.js built-in crypto
 *
 * Start: node server.js
 * Dev:   nodemon server.js
 * Open:  http://localhost:3000
 */
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use((req, _, next) => { console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`); next(); });

// Static frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart',     require('./routes/cart'));
app.use('/api/order',    require('./routes/order'));

// Health check
app.get('/api/health', (req, res) => res.json({ success:true, status:'ShopHub v3.0 ✅', time: new Date().toISOString() }));
// 404 for unknown api routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found.`
  });
});

// ✅ Catch-all → frontend (SAFE VERSION)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log('\n  ╔══════════════════════════════════════════╗');
  console.log('  ║     🛍️  ShopHub v3.0 — Server Ready     ║');
  console.log('  ╠══════════════════════════════════════════╣');
  console.log(`  ║  🌐  http://localhost:${PORT}                ║`);
  console.log('  ║  🔐  Auth: built-in crypto (no bcrypt)  ║');
  console.log('  ║  📦  Products: 40 items loaded           ║');
  console.log('  ╚══════════════════════════════════════════╝\n');
  console.log('  Demo accounts:');
  console.log('    user@example.com  / password123');
  console.log('    admin@shophub.com / admin123\n');
});
