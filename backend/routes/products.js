const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');

// ✅ Correct absolute path
const FILE = path.join(__dirname, '..', 'data', 'products.json');

// ✅ Safe read function (prevents crashes)
const read = () => {
  try {
    const data = fs.readFileSync(FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading products.json:', err);
    return [];
  }
};

/* ============================================
   GET /api/products/trending
============================================ */
router.get('/trending', (req, res) => {
  const products = read();

  const trending = products
    .sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews))
    .slice(0, 8);

  res.json({ success: true, products: trending });
});

/* ============================================
   GET /api/products
   Filters + Search + Sort
============================================ */
router.get('/', (req, res) => {
  let products = read();

  const { category, search, sort, minPrice, maxPrice } = req.query;

  // ✅ Category filter
  if (category && category !== 'all') {
    products = products.filter(p =>
      p.category?.toLowerCase() === category.toLowerCase()
    );
  }

  // ✅ Search
  if (search) {
    const q = search.toLowerCase();

    products = products.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }

  // ✅ Price filter
  if (minPrice) {
    products = products.filter(p => p.price >= Number(minPrice));
  }

  if (maxPrice) {
    products = products.filter(p => p.price <= Number(maxPrice));
  }

  // ✅ Sorting
  if (sort === 'price_asc') {
    products.sort((a, b) => a.price - b.price);
  }

  if (sort === 'price_desc') {
    products.sort((a, b) => b.price - a.price);
  }

  if (sort === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  }

  if (sort === 'discount') {
    products.sort((a, b) => b.discount - a.discount);
  }

  res.json({
    success: true,
    count: products.length,
    products
  });
});

/* ============================================
   POST /api/products/suggest
============================================ */
router.post('/suggest', (req, res) => {
  try {
    const { keywords = [], category = '', fileName = '' } = req.body;
    const products = read();

    let searchTerms = [...keywords];

    // ✅ Extract keywords from filename
    if (fileName) {
      const fileWords = fileName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ' ')
        .split(' ')
        .filter(w => w.length > 2);

      searchTerms.push(...fileWords);
    }

    // ✅ Score products
    const scored = products.map(p => {
      const text = [
        p.name,
        p.category,
        p.brand,
        p.description,
        ...(p.tags || [])
      ].join(' ').toLowerCase();

      let score = 0;

      searchTerms.forEach(term => {
        if (text.includes(term.toLowerCase())) score++;
      });

      // bonus
      if (category && p.category?.toLowerCase() === category.toLowerCase()) {
        score += 3;
      }

      return { ...p, _score: score };
    });

    let suggestions = scored
      .filter(p => p._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 8);

    // ✅ fallback
    if (suggestions.length === 0) {
      suggestions = products
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 8);
    }

    res.json({
      success: true,
      suggestions: suggestions.map(({ _score, ...p }) => p)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Suggestion failed'
    });
  }
});

/* ============================================
   GET /api/products/:id
============================================ */
router.get('/:id', (req, res) => {
  const products = read();

  const product = products.find(
    p => p.id === parseInt(req.params.id)
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found'
    });
  }

  res.json({ success: true, product });
});

module.exports = router;