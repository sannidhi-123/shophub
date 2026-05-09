# 🛍️ ShopHub — Modern Full-Stack E-Commerce Platform

<div align="center">

### ✨ Discover Your Perfect Style

A modern full-stack shopping platform with authentication, dark mode, AI-powered product suggestions, wishlist, cart management, and responsive UI.

🔗 Live Demo: https://shophub-d3bv.onrender.com

</div>

---

# 🚀 Features

## 🛒 E-Commerce Features
- 40+ curated fashion & electronics products
- Product search, filtering & sorting
- Trending products section
- Product detail previews
- Wishlist functionality
- Recently viewed products
- Shopping cart with quantity management
- Full checkout flow with order confirmation

---

# 🔐 Authentication System

- User Signup & Login
- Secure password hashing using Node.js Crypto (PBKDF2-SHA512)
- Custom JWT-style authentication tokens
- Protected routes & profile management
- Offline login support using localStorage fallback

---

# 🎨 UI / UX Features

- Fully responsive design
- Modern glassmorphism-inspired UI
- Dark / Light mode toggle
- Voice Search (Web Speech API)
- Animated interactive components
- Mobile-friendly experience
- Clean product cards & hero section

---

# 🤖 Smart Features

- AI-style image product suggestions
- Personalized style quiz
- Dynamic search system
- Wishlist persistence
- Recently viewed tracking

---

# 🧰 Tech Stack

## Frontend
- HTML5
- CSS3
- JavaScript (Vanilla JS)

## Backend
- Node.js
- Express.js

## Authentication & Security
- Node.js Crypto
- PBKDF2 Hashing
- HMAC-SHA256 Tokens

## Deployment
- Render (Backend Hosting)
- GitHub (Version Control)

---

# 🌐 Live Project

👉 https://shophub-d3bv.onrender.com

---

# 📸 Screenshots

## 🏠 Homepage
- Modern hero section
- Search + categories
- Product showcase

## 🌙 Dark Mode
- Fully themed dark interface
- Persistent theme storage

## 👤 Authentication
- Login / Signup
- Offline mode support

## 🛒 Cart & Checkout
- Quantity management
- Checkout form
- Order placement

---

# ⚡ Quick Start

## 1️⃣ Clone Repository

```bash
git clone https://github.com/sannidhi-123/shophub.git
cd shophub
```

---

## 2️⃣ Install Dependencies

```bash
cd backend
npm install
```

---

## 3️⃣ Start Server

```bash
node server.js
```

---

## 4️⃣ Open in Browser

```bash
http://localhost:3000
```

---

# 🔑 Demo Accounts

| Role | Email | Password |
|---|---|---|
| User | user@example.com | password123 |
| Admin | admin@shophub.com | admin123 |

---

# 📂 Project Structure

```bash
shophub/
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── profile.html
│   ├── checkout.html
│   ├── css/
│   │   ├── styles.css
│   │   └── theme-upgrade.css
│   └── js/
│       ├── api.js
│       ├── app.js
│       └── ratings.js
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── middleware/
│   ├── controllers/
│   ├── routes/
│   └── data/
│
├── package.json
└── README.md
```

---

# 🔌 API Endpoints

## 🔐 Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get profile |
| PUT | `/api/auth/profile` | Update profile |

---

## 🛍️ Products

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | All products |
| GET | `/api/products/trending` | Trending products |
| GET | `/api/products/:id` | Single product |
| POST | `/api/products/suggest` | AI product suggestions |

---

## 🛒 Cart

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cart` | Get cart |
| POST | `/api/cart` | Add to cart |
| PUT | `/api/cart/:id` | Update quantity |
| DELETE | `/api/cart/:id` | Remove item |

---

# 🔒 Password Security

ShopHub uses secure password hashing without external auth libraries.

```text
PBKDF2-SHA512
10000 iterations
Random Salt
Timing-safe verification
```

This provides production-grade password security using only Node.js built-in crypto.

---

# 📈 Future Improvements

- MongoDB integration
- Razorpay / Stripe payments
- Admin dashboard
- Product reviews & ratings
- Email OTP authentication
- Order tracking
- AI recommendations
- Separate frontend deployment on Vercel

---

# 👨‍💻 Developer

### Sannidhi Chouthayi

- Full Stack Developer
- Passionate about UI/UX & Web Development

GitHub: https://github.com/sannidhi-123

---

# ⭐ Support

If you like this project:

⭐ Star the repository  
🍴 Fork the project  
🚀 Share it with others
