# 🛍️ ShopHub v3.0 — Full-Stack E-commerce

## ⚡ Quick Start (3 steps)

```bash
# 1. Go into backend folder
cd backend

# 2. Install dependencies (only express + cors — no auth packages needed!)
npm install

# 3. Start the server
node server.js
```

Then open **http://localhost:3000** in your browser.

---

## 🔐 Demo Accounts (ready to use)

| Email | Password |
|---|---|
| `user@example.com` | `password123` |
| `admin@shophub.com` | `admin123` |

---

## 📁 Project Structure

```
shophub-final/
├── frontend/
│   ├── index.html        ← Main store page
│   ├── login.html        ← Sign In + Create Account (works offline too!)
│   ├── profile.html      ← User profile + Style Quiz
│   ├── checkout.html     ← Checkout + order placement
│   ├── css/styles.css    ← All styles + dark mode
│   └── js/
│       ├── api.js        ← All fetch/API calls
│       └── app.js        ← All UI logic
│
└── backend/
    ├── server.js                     ← Express entry point
    ├── package.json                  ← Only needs: express, cors
    ├── middleware/auth.js            ← Token auth (built-in crypto)
    ├── controllers/authController.js ← Signup/login/profile
    ├── routes/
    │   ├── auth.js       ← /api/auth/*
    │   ├── products.js   ← /api/products/* (+ /suggest)
    │   ├── cart.js       ← /api/cart/*
    │   └── order.js      ← /api/order
    └── data/
        ├── users.json    ← User accounts (PBKDF2 hashed passwords)
        ├── products.json ← 40 products
        ├── cart.json     ← Active cart state
        └── orders.json   ← Order history
```

---

## 🌐 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/signup | Create account |
| POST | /api/auth/login  | Login → returns token |
| GET  | /api/auth/me     | Get profile (🔒 token required) |
| PUT  | /api/auth/profile | Update name (🔒) |
| POST | /api/auth/wishlist/:id | Toggle wishlist (🔒) |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET  | /api/products | All products |
| GET  | /api/products?search=shirt | Search |
| GET  | /api/products?category=Men | Filter |
| GET  | /api/products?sort=price_asc | Sort |
| GET  | /api/products/trending | Top rated |
| POST | /api/products/suggest | Image AI suggestions |
| GET  | /api/products/:id | Single product |

### Cart
| Method | Endpoint | Description |
|---|---|---|
| GET    | /api/cart | Get cart |
| POST   | /api/cart | Add item |
| PUT    | /api/cart/:id | Update qty |
| DELETE | /api/cart/:id | Remove item |
| DELETE | /api/cart | Clear cart |

---

## ✅ Features

- **Auth**: Signup + Login with PBKDF2 password hashing (built-in crypto, no bcrypt needed)
- **JWT-style tokens**: Custom HMAC-SHA256 tokens, 7-day expiry
- **Offline mode**: Login page works without backend (saves to localStorage)
- **40 Products**: Men, Women, Footwear, Electronics, Beauty, Accessories
- **Search**: Live search across name, brand, category, tags, description
- **Image AI Suggestions**: Upload photo → keyword extraction → matched products
- **Dark Mode**: System-aware, persisted
- **Cart**: Full CRUD, backend sync + localStorage fallback
- **Wishlist**: Server-synced when logged in
- **Recently Viewed**: Tracks browsing history
- **Voice Search**: Web Speech API (Chrome/Edge)
- **Trending section**: Top-rated products
- **Checkout**: Full order form + order ID confirmation
- **Profile page**: Edit name, style quiz, wishlist preview
- **Responsive**: Mobile-friendly throughout

---

## 🔧 How Password Security Works

No `bcryptjs` needed! Uses Node.js built-in `crypto`:

```
Store:  PBKDF2-SHA512(password, randomSalt, 10000 rounds) → "salt:hash"
Verify: PBKDF2-SHA512(attempt, salt) → timing-safe compare
```

This is production-grade security with zero npm dependencies for auth.
