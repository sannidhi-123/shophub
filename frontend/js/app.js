/**
 * app.js — ShopHub v3.0 Main Frontend Logic
 *
 * Features:
 *  ✅ Dark mode (persisted)
 *  ✅ Auth-aware navbar
 *  ✅ Products: load, render, filter, sort, search
 *  ✅ Cart: add, remove, qty, total — backend + localStorage fallback
 *  ✅ Wishlist: server-synced when logged in
 *  ✅ Product detail modal with size picker
 *  ✅ Recently viewed
 *  ✅ Trending section
 *  ✅ Voice search
 *  ✅ Image-based suggestions (mock AI)
 *  ✅ Toast notifications
 *  ✅ Category + sort filter
 */

/* ════════════ STATE ════════════ */
let allProducts    = [];
let cart           = [];
let wishlist       = [];
let recentlyViewed = [];
let currentFilter  = 'all';
let currentSort    = '';
let currentSearch  = '';   // ✅ FIX: Single source of truth for search query
let isBackend      = false;

/* ════════════ FALLBACK PRODUCTS (when backend is offline) ════════════ */
// ✅ FIX 1: FALLBACK now contains ALL 40 products (was only 10 before).
// When the backend is offline, all 40 products will still display correctly.
const FALLBACK = [
  {id:1,  name:"Classic Linen Blend Shirt",            category:"Men",         price:1299,  oldPrice:1799,  discount:28, image:"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",  rating:4.5, reviews:128,  description:"Breathable linen-blend shirt with a relaxed fit. Perfect for warm days.",                                   brand:"CasualWear",  tags:["casual","summer","linen"],          sizes:["S","M","L","XL"]},
  {id:2,  name:"Slim Fit Chinos",                      category:"Men",         price:1599,  oldPrice:2199,  discount:27, image:"https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&q=80",  rating:4.3, reviews:89,   description:"Premium slim-fit chinos in stretch fabric. Office to evening ready.",                                       brand:"UrbanFit",    tags:["formal","casual","slim"],           sizes:["30","32","34","36"]},
  {id:3,  name:"Denim Trucker Jacket",                 category:"Men",         price:2799,  oldPrice:3699,  discount:24, image:"https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&q=80",  rating:4.5, reviews:203,  description:"Classic denim trucker jacket with contrast stitching. A wardrobe staple.",                                  brand:"DenimCo",     tags:["denim","jacket","casual"],          sizes:["S","M","L","XL","XXL"]},
  {id:4,  name:"Polo Ralph Lauren Inspired Tee",       category:"Men",         price:899,   oldPrice:1299,  discount:31, image:"https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",  rating:4.2, reviews:312,  description:"Premium cotton polo with embroidered logo. Crisp and comfortable.",                                         brand:"UrbanFit",    tags:["polo","casual","cotton"],           sizes:["XS","S","M","L","XL"]},
  {id:5,  name:"Formal Dress Shirt",                   category:"Men",         price:1199,  oldPrice:1599,  discount:25, image:"https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80",  rating:4.4, reviews:156,  description:"Crisp poplin dress shirt with spread collar. Perfect for boardroom to dinner.",                              brand:"SmartWear",   tags:["formal","office","shirt"],          sizes:["S","M","L","XL"]},
  {id:6,  name:"Jogger Track Pants",                   category:"Men",         price:999,   oldPrice:1499,  discount:33, image:"https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",  rating:4.1, reviews:78,   description:"Lightweight jogger pants with elasticated waist and zip pockets.",                                          brand:"ActiveFit",   tags:["sports","casual","jogger"],         sizes:["S","M","L","XL"]},
  {id:7,  name:"Floral Summer Midi Dress",             category:"Women",       price:2499,  oldPrice:3299,  discount:24, image:"https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80",  rating:4.8, reviews:256,  description:"Breezy floral midi dress with adjustable straps. Your summer essential.",                                    brand:"FloralDream", tags:["dress","summer","floral"],          sizes:["XS","S","M","L"]},
  {id:8,  name:"Satin Wrap Evening Dress",             category:"Women",       price:3999,  oldPrice:5299,  discount:25, image:"https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",  rating:4.9, reviews:145,  description:"Luxurious satin wrap dress in rich jewel tones. Effortlessly elegant.",                                     brand:"EveGlam",     tags:["evening","formal","satin"],         sizes:["XS","S","M","L","XL"]},
  {id:9,  name:"High-Waist Straight Jeans",            category:"Women",       price:1899,  oldPrice:2499,  discount:24, image:"https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",  rating:4.4, reviews:312,  description:"Classic high-waist straight jeans in a clean mid-blue wash.",                                               brand:"DenimCo",     tags:["jeans","casual","high-waist"],      sizes:["26","28","30","32","34"]},
  {id:10, name:"Ribbed Knit Crop Top",                 category:"Women",       price:899,   oldPrice:1299,  discount:31, image:"https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=600&q=80",  rating:4.2, reviews:67,   description:"Soft ribbed-knit crop top with slim fit. Perfect for layering.",                                            brand:"KnitCo",      tags:["crop","casual","knit"],             sizes:["XS","S","M","L"]},
  {id:11, name:"Wool Oversize Coat",                   category:"Women",       price:4999,  oldPrice:6499,  discount:23, image:"https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=600&q=80",  rating:4.6, reviews:89,   description:"Premium wool oversize coat. Warm, structured and timeless.",                                                brand:"LuxLayer",    tags:["coat","winter","luxury"],           sizes:["S","M","L","XL"]},
  {id:12, name:"Pleated Wide-Leg Trousers",            category:"Women",       price:1599,  oldPrice:2199,  discount:27, image:"https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80",  rating:4.1, reviews:98,   description:"Elegant wide-leg trousers with front pleat. Smart and comfortable.",                                        brand:"EleStyle",    tags:["trousers","formal","wide-leg"],     sizes:["XS","S","M","L","XL"]},
  {id:13, name:"Canvas Low-Top Sneakers",              category:"Footwear",    price:2199,  oldPrice:2999,  discount:27, image:"https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80",  rating:4.3, reviews:432,  description:"Classic canvas sneakers with vulcanized rubber sole. A daily staple.",                                     brand:"StreetStep",  tags:["sneakers","casual","canvas"],       sizes:["6","7","8","9","10","11"]},
  {id:14, name:"Suede Chelsea Boots",                  category:"Footwear",    price:3499,  oldPrice:4599,  discount:24, image:"https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&q=80",  rating:4.8, reviews:164,  description:"Premium suede Chelsea boots with elastic side panels and stacked heel.",                                    brand:"BootCraft",   tags:["boots","chelsea","suede"],          sizes:["6","7","8","9","10"]},
  {id:15, name:"Running Sports Shoes",                 category:"Footwear",    price:2899,  oldPrice:3999,  discount:28, image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",  rating:4.6, reviews:289,  description:"Lightweight running shoes with cushioned midsole and breathable mesh.",                                     brand:"ActiveFit",   tags:["running","sports","gym"],           sizes:["7","8","9","10","11","12"]},
  {id:16, name:"Leather Oxford Shoes",                 category:"Footwear",    price:3999,  oldPrice:5499,  discount:27, image:"https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80",  rating:4.7, reviews:112,  description:"Hand-stitched leather Oxford shoes with Goodyear welt construction.",                                       brand:"BootCraft",   tags:["formal","leather","oxford"],        sizes:["7","8","9","10","11"]},
  {id:17, name:"Leather Crossbody Bag",                category:"Accessories", price:3299,  oldPrice:4499,  discount:27, image:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",  rating:4.7, reviews:178,  description:"Genuine leather crossbody bag with adjustable strap and gold hardware.",                                   brand:"LeatherLux",  tags:["bag","leather","crossbody"],        sizes:["One Size"]},
  {id:18, name:"Gold Layered Necklace Set",            category:"Accessories", price:799,   oldPrice:1099,  discount:27, image:"https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80",  rating:4.6, reviews:287,  description:"Delicate gold-tone layered necklace set. Three complementary pieces.",                                     brand:"GoldGlam",    tags:["necklace","jewellery","layered"],   sizes:["One Size"]},
  {id:19, name:"Classic Leather Wallet",               category:"Accessories", price:1299,  oldPrice:1799,  discount:28, image:"https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80",  rating:4.5, reviews:234,  description:"Slim bi-fold leather wallet with RFID blocking. 6 card slots.",                                             brand:"LeatherLux",  tags:["wallet","leather","slim"],          sizes:["One Size"]},
  {id:20, name:"Aviator Sunglasses",                   category:"Accessories", price:1599,  oldPrice:2199,  discount:27, image:"https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80",  rating:4.4, reviews:156,  description:"Classic aviator sunglasses with UV400 protection and metal frame.",                                         brand:"SunStyle",    tags:["sunglasses","aviator","UV"],        sizes:["One Size"]},
  {id:21, name:"Wireless Noise-Cancelling Headphones", category:"Electronics", price:8999,  oldPrice:12999, discount:31, image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",  rating:4.8, reviews:567,  description:"Premium ANC headphones with 30hr battery and multipoint connection.",                                       brand:"SoundPro",    tags:["headphones","wireless","ANC"],      sizes:["One Size"]},
  {id:22, name:"Smart Watch Pro",                      category:"Electronics", price:12999, oldPrice:17999, discount:28, image:"https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80",  rating:4.7, reviews:423,  description:"Advanced smartwatch with health monitoring, GPS and 7-day battery life.",                                   brand:"TechWear",    tags:["smartwatch","fitness","GPS"],       sizes:["44mm","46mm"]},
  {id:23, name:"Bluetooth Speaker Portable",           category:"Electronics", price:3499,  oldPrice:4999,  discount:30, image:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80",  rating:4.5, reviews:312,  description:"360° sound, IPX7 waterproof, 20hr playtime. Party anywhere.",                                               brand:"SoundPro",    tags:["speaker","bluetooth","portable"],   sizes:["One Size"]},
  {id:24, name:"Wireless Earbuds TWS",                 category:"Electronics", price:4999,  oldPrice:6999,  discount:29, image:"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80",  rating:4.6, reviews:489,  description:"True wireless earbuds with ANC, 28hr case battery and transparency mode.",                                  brand:"SoundPro",    tags:["earbuds","TWS","wireless"],         sizes:["One Size"]},
  {id:25, name:"Laptop Backpack 30L",                  category:"Electronics", price:2999,  oldPrice:3999,  discount:25, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",  rating:4.4, reviews:198,  description:"Water-resistant 30L laptop backpack with USB charging port. Fits 17in laptop.",                              brand:"UrbanPack",   tags:["backpack","laptop","travel"],       sizes:["One Size"]},
  {id:26, name:"Vitamin C Brightening Serum",          category:"Beauty",      price:899,   oldPrice:1299,  discount:31, image:"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80",  rating:4.7, reviews:634,  description:"Concentrated 20% Vitamin C serum with hyaluronic acid. Fades dark spots in 4 weeks.",                       brand:"GlowLab",     tags:["serum","vitamin-c","brightening"],  sizes:["30ml","60ml"]},
  {id:27, name:"Matte Lipstick Collection",            category:"Beauty",      price:599,   oldPrice:799,   discount:25, image:"https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=600&q=80",  rating:4.5, reviews:423,  description:"Long-wearing matte lipstick with hydrating formula. 12-hour hold.",                                         brand:"ColorPop",    tags:["lipstick","matte","makeup"],        sizes:["One Size"]},
  {id:28, name:"Perfume Eau de Parfum",                category:"Beauty",      price:3499,  oldPrice:4999,  discount:30, image:"https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80",  rating:4.8, reviews:289,  description:"Luxurious floral-woody fragrance. Top: Rose, Heart: Oud, Base: Amber.",                                    brand:"LuxeScent",   tags:["perfume","fragrance","EDP"],        sizes:["50ml","100ml"]},
  {id:29, name:"Moisturizing Face Cream SPF50",        category:"Beauty",      price:1299,  oldPrice:1799,  discount:28, image:"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80",  rating:4.6, reviews:512,  description:"Lightweight daily moisturizer with SPF 50 PA+++. Non-greasy, all skin types.",                              brand:"GlowLab",     tags:["moisturizer","SPF","daily"],        sizes:["50ml","100ml"]},
  {id:30, name:"Hair Care Luxury Set",                 category:"Beauty",      price:2199,  oldPrice:2999,  discount:27, image:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",  rating:4.4, reviews:178,  description:"Argan oil shampoo + conditioner + hair mask. Restores shine and strength.",                                 brand:"SilkHair",    tags:["haircare","shampoo","conditioner"], sizes:["Set"]},
  {id:31, name:"Oversized Graphic Hoodie",             category:"Men",         price:1499,  oldPrice:1999,  discount:25, image:"https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=600&q=80",  rating:4.4, reviews:234,  description:"Premium fleece hoodie with kangaroo pocket. Relaxed boxy fit.",                                             brand:"StreetStyle", tags:["hoodie","oversized","streetwear"],  sizes:["S","M","L","XL","XXL"]},
  {id:32, name:"Athletic Compression Shorts",          category:"Men",         price:799,   oldPrice:1099,  discount:27, image:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",  rating:4.2, reviews:145,  description:"4-way stretch compression shorts with moisture-wicking fabric.",                                            brand:"ActiveFit",   tags:["shorts","gym","compression"],       sizes:["S","M","L","XL"]},
  {id:33, name:"Blazer Slim Fit",                      category:"Men",         price:4499,  oldPrice:5999,  discount:25, image:"https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80",  rating:4.7, reviews:189,  description:"Italian-cut slim blazer in premium fabric. Fully lined with ticket pocket.",                                brand:"SmartWear",   tags:["blazer","formal","slim"],           sizes:["S","M","L","XL"]},
  {id:34, name:"Women's Yoga Leggings",                category:"Women",       price:1299,  oldPrice:1799,  discount:28, image:"https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80",  rating:4.8, reviews:567,  description:"High-waist 4-way stretch yoga leggings with phone pocket. Squat-proof.",                                   brand:"ActiveFit",   tags:["yoga","leggings","gym"],            sizes:["XS","S","M","L","XL"]},
  {id:35, name:"Silk Blouse Button-Down",              category:"Women",       price:2999,  oldPrice:3999,  discount:25, image:"https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&q=80",  rating:4.6, reviews:134,  description:"Luxurious silk-feel satin blouse with pearl buttons. Drapes beautifully.",                                  brand:"SilkWear",    tags:["silk","blouse","formal"],           sizes:["XS","S","M","L","XL"]},
  {id:36, name:"Mini Shoulder Bag",                    category:"Women",       price:2499,  oldPrice:3299,  discount:24, image:"https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80",  rating:4.5, reviews:223,  description:"Compact structured shoulder bag in vegan leather with gold chain strap.",                                   brand:"ChicBag",     tags:["bag","mini","shoulder"],            sizes:["One Size"]},
  {id:37, name:"Silver Hoop Earrings Set",             category:"Accessories", price:599,   oldPrice:799,   discount:25, image:"https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",  rating:4.4, reviews:312,  description:"Set of 5 sterling silver hoop earrings in different sizes. Hypoallergenic.",                                brand:"GoldGlam",    tags:["earrings","hoops","silver"],        sizes:["One Size"]},
  {id:38, name:"Mechanical Gaming Keyboard",           category:"Electronics", price:6999,  oldPrice:9999,  discount:30, image:"https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80",  rating:4.7, reviews:345,  description:"RGB mechanical keyboard with Cherry MX switches and PBT keycaps.",                                          brand:"TechPro",     tags:["keyboard","gaming","mechanical"],   sizes:["TKL","Full Size"]},
  {id:39, name:"Retinol Anti-Aging Night Cream",       category:"Beauty",      price:1599,  oldPrice:2199,  discount:27, image:"https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80",  rating:4.6, reviews:423,  description:"Clinical-strength 0.3% retinol night cream. Reduces fine lines in 4 weeks.",                                brand:"GlowLab",     tags:["retinol","anti-aging","night"],     sizes:["30ml","50ml"]},
  {id:40, name:"Leather Belt Classic",                 category:"Accessories", price:899,   oldPrice:1299,  discount:31, image:"https://images.unsplash.com/photo-1553531384-cc64ac80f931?w=600&q=80",  rating:4.3, reviews:189,  description:"Full-grain leather belt with single prong buckle. 3.5cm width, formal and casual.",                         brand:"LeatherLux",  tags:["belt","leather","formal"],          sizes:["32","34","36","38","40"]},
];

/* ════════════ INIT ════════════ */
window.addEventListener('load', async () => {
  setTimeout(() => document.getElementById('loader')?.classList.add('hidden'), 600);

  cart           = JSON.parse(localStorage.getItem('shophub_cart')     || '[]');
  wishlist       = JSON.parse(localStorage.getItem('shophub_wishlist') || '[]');
  recentlyViewed = JSON.parse(localStorage.getItem('shophub_recent')   || '[]');

  applyTheme(localStorage.getItem('shophub_theme') || 'light');
  updateNavbarUser();
  updateCartUI();

  await loadProducts();
  await loadTrending();
  renderRecentlyViewed();
  wireButtons();

  // Initialize ratings system
  if (window.ShopRatings) {
    window.ShopRatings.seedDefaultRatings(allProducts);
    window.ShopRatings.initProjectStarBar();
  }

  if (isLoggedIn()) syncUserData();
});

/* ════════════ THEME ════════════ */
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('shophub_theme', t);
  // Update all theme toggle buttons on the page
  document.querySelectorAll('#darkToggle, .dark-toggle').forEach(btn => {
    btn.textContent = t === 'dark' ? '☀️' : '🌙';
    btn.setAttribute('title', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });
}
window.toggleDarkMode = () => applyTheme(localStorage.getItem('shophub_theme') === 'dark' ? 'light' : 'dark');

/* ════════════ NAVBAR USER ════════════ */
function updateNavbarUser() {
  const user    = getCurrentUser();
  const authBtn = document.getElementById('authBtn');
  if (!authBtn) return;

  if (user) {
    // ✅ FIX: Replace Sign In button with full user menu dropdown
    const firstName = user.name.split(' ')[0];
    authBtn.outerHTML = `
      <div class="user-menu" id="userMenu" style="position:relative;display:inline-block;">
        <button class="btn-ghost user-menu-trigger" id="userMenuBtn"
          style="display:flex;align-items:center;gap:6px;"
          onclick="document.getElementById('userDropdown').classList.toggle('open')">
          <i class="fa-solid fa-circle-user"></i>
          Hi, ${firstName}
          <i class="fa-solid fa-chevron-down" style="font-size:10px;opacity:.7;"></i>
        </button>
        <div id="userDropdown" class="user-dropdown"
          style="display:none;position:absolute;right:0;top:calc(100% + 8px);
                 background:var(--white);border:1px solid var(--border);border-radius:14px;
                 box-shadow:0 12px 40px rgba(0,0,0,.15);min-width:200px;z-index:9999;overflow:hidden;">
          <div style="padding:14px 16px;border-bottom:1px solid var(--border);background:var(--bg);">
            <p style="font-size:13px;font-weight:700;color:var(--text);margin:0;">${user.name}</p>
            <p style="font-size:11px;color:var(--text-muted);margin:2px 0 0;">${user.email || ''}</p>
          </div>
          <a href="profile.html" style="display:flex;align-items:center;gap:10px;padding:12px 16px;color:var(--text);text-decoration:none;font-size:13px;font-weight:500;transition:background .15s;" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''"
            ><i class="fa-solid fa-user" style="width:16px;color:var(--primary);"></i> My Profile</a>
          <a href="profile.html#wishlist" style="display:flex;align-items:center;gap:10px;padding:12px 16px;color:var(--text);text-decoration:none;font-size:13px;font-weight:500;transition:background .15s;" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''"
            ><i class="fa-regular fa-heart" style="width:16px;color:var(--primary);"></i> Wishlist</a>
          <a href="profile.html#orders" style="display:flex;align-items:center;gap:10px;padding:12px 16px;color:var(--text);text-decoration:none;font-size:13px;font-weight:500;transition:background .15s;" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''"
            ><i class="fa-solid fa-box" style="width:16px;color:var(--primary);"></i> My Orders</a>
          <div style="border-top:1px solid var(--border);margin:4px 0;"></div>
          <button onclick="doLogout()" style="display:flex;align-items:center;gap:10px;width:100%;padding:12px 16px;color:#dc2626;background:none;border:none;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;text-align:left;transition:background .15s;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background=''"
            ><i class="fa-solid fa-right-from-bracket" style="width:16px;"></i> Logout</button>
        </div>
      </div>`;

    // Toggle dropdown open/close styling
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
      // Use CSS display toggle via class
      dropdown.style.display = 'block';
      dropdown.style.opacity = '0';
      dropdown.style.pointerEvents = 'none';
      dropdown.style.transform = 'translateY(-6px)';
      dropdown.style.transition = 'opacity .2s, transform .2s';

      document.getElementById('userMenuBtn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.style.opacity === '1';
        dropdown.style.opacity   = isOpen ? '0' : '1';
        dropdown.style.transform = isOpen ? 'translateY(-6px)' : 'translateY(0)';
        dropdown.style.pointerEvents = isOpen ? 'none' : 'auto';
      });

      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (!document.getElementById('userMenu')?.contains(e.target)) {
          dropdown.style.opacity       = '0';
          dropdown.style.transform     = 'translateY(-6px)';
          dropdown.style.pointerEvents = 'none';
        }
      }, { once: false });
    }

  } else {
    authBtn.textContent = 'Sign In';
    authBtn.onclick     = () => window.location.href = 'login.html';
  }
}

// Logout helper exposed globally
window.doLogout = function() {
  logoutUser();
  showToast('Logged out. See you soon! 👋');
  setTimeout(() => window.location.href = 'index.html', 1000);
};

/* ════════════ SYNC FROM SERVER ════════════ */
async function syncUserData() {
  try {
    const data = await getMeAPI();
    if (data.user) {
      localStorage.setItem('shophub_user', JSON.stringify(data.user));
      wishlist       = data.user.wishlist       || [];
      recentlyViewed = data.user.recentlyViewed || [];
      localStorage.setItem('shophub_wishlist', JSON.stringify(wishlist));
      localStorage.setItem('shophub_recent',   JSON.stringify(recentlyViewed));
      renderRecentlyViewed();
      renderProducts(getFiltered());
    }
  } catch {}
}

/* ════════════ LOAD PRODUCTS ════════════ */
async function loadProducts() {
  try {
    allProducts = await fetchProducts();
    isBackend   = true;
    showStatus('✓ Store loaded', 'online');
  } catch {
    allProducts = FALLBACK;
    isBackend   = false;
    showStatus('⚡ Offline — sample products shown', 'offline');
  }
  renderProducts(allProducts);
  const el = document.getElementById('productCount');
  if (el) el.textContent = `${allProducts.length} products`;
}

async function loadTrending() {
  const grid = document.getElementById('trendingGrid');
  if (!grid) return;
  try {
    const items = await fetchTrending();
    renderMiniCards(items.slice(0,4), grid);
  } catch {
    renderMiniCards([...allProducts].sort((a,b)=>b.rating-a.rating).slice(0,4), grid);
  }
}

function renderMiniCards(products, container) {
  container.innerHTML = products.map(p => `
    <div class="product-card" onclick="openProductModal(${p.id})" style="cursor:pointer;">
      <div class="image-container">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/600x600/fef0ee/E8503A?text=ShopHub'">
        <span class="discount-badge">-${p.discount}%</span>
      </div>
      <div class="product-info">
        <span class="product-category">${p.category}</span>
        <h3>${p.name}</h3>
        <div class="price-row">
          <span class="price-current">₹${p.price.toLocaleString()}</span>
          <div class="rating"><i class="fa-solid fa-star"></i> ${p.rating}</div>
        </div>
      </div>
    </div>`).join('');
}

/* ════════════ FILTER + SORT ════════════ */

function getFiltered() {
  // FIX: Use currentSearch state variable (single source of truth).
  // Fallback to reading DOM in case state is somehow out of sync.
  const domInput = document.getElementById('searchInput');
  const q = (currentSearch || (domInput ? domInput.value : '')).toLowerCase().trim();

  let list = [...allProducts];

  // Category filter
  if (currentFilter !== 'all') {
    list = list.filter(p =>
      p.category.toLowerCase() === currentFilter.toLowerCase()
    );
  }

  // FIX: Enhanced search — checks all fields including subcategory
  if (q) {
    // Split multi-word query and match all tokens (AND logic for precision)
    const tokens = q.split(/\s+/).filter(Boolean);
    list = list.filter(p => {
      const haystack = [
        p.name        || '',
        p.category    || '',
        p.subcategory || '',
        p.brand       || '',
        p.description || '',
        ...(p.tags    || [])
      ].join(' ').toLowerCase();

      // Every token must appear somewhere (AND matching)
      return tokens.every(token => haystack.includes(token));
    });
  }

  // Sorting
  const sorted = [...list];

  if (currentSort === 'price_asc')  sorted.sort((a,b) => a.price - b.price);
  if (currentSort === 'price_desc') sorted.sort((a,b) => b.price - a.price);
  if (currentSort === 'rating')     sorted.sort((a,b) => b.rating - a.rating);
  if (currentSort === 'discount')   sorted.sort((a,b) => b.discount - a.discount);

  return sorted;
}

/* ════════════ RENDER CARDS ════════════ */
function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  const countEl = document.getElementById('productCount');
  if (countEl) {
    const searchTerm = currentSearch.trim();
    if (searchTerm) {
      countEl.innerHTML = `<span>${products.length} result${products.length!==1?'s':''}</span> <span style="background:var(--primary-light,#fef0ee);color:var(--primary,#E8503A);padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;margin-left:6px;">&ldquo;${searchTerm}&rdquo;</span> <button onclick="window.resetFilter()" title="Clear search" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:13px;margin-left:2px;padding:0 4px;">&times;</button>`;
    } else {
      countEl.textContent = `${products.length} product${products.length!==1?'s':''}`;
    }
  }

  if (!products.length) {
    const isSearching = currentSearch.trim().length > 0;
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--text-muted);">
        <i class="fa-solid fa-${isSearching ? 'magnifying-glass' : 'box-open'}" style="font-size:40px;opacity:.2;display:block;margin-bottom:14px;"></i>
        <p style="font-size:16px;font-weight:600;color:var(--text);margin-bottom:8px;">
          ${isSearching ? `No results for &ldquo;${currentSearch}&rdquo;` : 'No products found'}
        </p>
        <p style="font-size:13px;margin-bottom:16px;">
          ${isSearching ? 'Try different keywords or browse all products below.' : 'Check back soon for new arrivals.'}
        </p>
        ${isSearching ? `<button onclick="window.resetFilter()" style="padding:10px 22px;background:var(--primary,#E8503A);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">Clear Search</button>` : ''}
      </div>`; return;
  }

  grid.innerHTML = '';
  products.forEach((p, i) => {
    const old   = p.oldPrice || Math.round(p.price / 0.76);
    const disc  = p.discount || Math.round((1 - p.price/old)*100);
    const liked = wishlist.includes(p.id);
    const n     = (p.name||'').replace(/'/g,"\\'");

    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${i*0.04}s`;
    card.innerHTML = `
      <div class="image-container" onclick="openProductModal(${p.id})" style="cursor:pointer;">
        <img src="${p.image}" 
     alt="${p.name}" 
     loading="lazy"
     onerror="this.onerror=null;this.src='https://placehold.co/500x500/fef0ee/E8503A?text=ShopHub'">
        <span class="discount-badge">-${disc}%</span>
        <button class="wishlist-btn ${liked?'liked':''}"
          onclick="event.stopPropagation();handleWishlist(${p.id})" aria-label="Wishlist">
          <i class="fa-${liked?'solid':'regular'} fa-heart"></i>
        </button>
        <div class="quick-add-bar"
          onclick="event.stopPropagation();handleAddToCart(${p.id},'${n}',${p.price},'${p.image}')">
          <i class="fa-solid fa-plus"></i> Quick Add
        </div>
      </div>
      <div class="product-info">
        <span class="product-category">${p.category}</span>
        <h3 onclick="openProductModal(${p.id})" style="cursor:pointer;">${p.name}</h3>
        <div class="price-row">
          <div>
            <span class="price-current">₹${p.price.toLocaleString()}</span>
            <span class="price-old">₹${old.toLocaleString()}</span>
          </div>
          <div class="rating" id="card-rating-${p.id}">
            <i class="fa-solid fa-star" style="color:#F59E0B;"></i>
            <span>${(window.ShopRatings?.getProductRating(p.id)?.avg || p.rating || 4.3).toFixed(1)}</span>
            <span style="opacity:.7;">(${(window.ShopRatings?.getProductRating(p.id)?.count || p.reviews || 100).toLocaleString()})</span>
          </div>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

/* ════════════ PRODUCT MODAL ════════════ */
async function openProductModal(id) {
  let p = allProducts.find(x => x.id === id);
  if (!p) { try { p = await fetchProductById(id); } catch { return; } }

  // Track recently viewed
  recentlyViewed = [id, ...recentlyViewed.filter(x=>x!==id)].slice(0,12);
  localStorage.setItem('shophub_recent', JSON.stringify(recentlyViewed));
  renderRecentlyViewed();
  if (isLoggedIn()) addRecentlyViewedAPI(id);

  document.getElementById('productModal')?.remove();

  const old    = p.oldPrice || Math.round(p.price/0.76);
  const disc   = p.discount || Math.round((1-p.price/old)*100);
  const liked  = wishlist.includes(id);
  const n      = (p.name||'').replace(/'/g,"\\'");

  const overlay = document.createElement('div');
  overlay.id = 'productModal';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease;';

  overlay.innerHTML = `
    <div style="background:var(--white);border-radius:20px;max-width:840px;width:100%;
      display:grid;grid-template-columns:1fr 1fr;overflow:hidden;
      box-shadow:0 32px 80px rgba(0,0,0,.25);position:relative;max-height:90vh;overflow-y:auto;">
      <img src="${p.image}" alt="${p.name}" style="width:100%;height:380px;object-fit:cover;display:block;" onerror="this.onerror=null;this.src='https://placehold.co/600x380/fef0ee/E8503A?text=ShopHub'">
      <button onclick="closeModal()" style="position:absolute;top:14px;right:16px;background:rgba(255,255,255,.9);border:none;border-radius:50%;width:34px;height:34px;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.15);z-index:2;">✕</button>
      <div style="padding:32px 28px;display:flex;flex-direction:column;gap:12px;">
        <span style="font-size:11px;font-weight:700;color:var(--primary);letter-spacing:.08em;text-transform:uppercase;">${p.category} · ${p.brand||''}</span>
        <h2 style="font-size:20px;font-weight:700;color:var(--text);line-height:1.3;">${p.name}</h2>
        <p style="font-size:13.5px;color:var(--text-muted);line-height:1.65;">${p.description||'Premium quality product from our curated collection.'}</p>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <span style="font-size:26px;font-weight:800;color:var(--text);">₹${p.price.toLocaleString()}</span>
          <span style="font-size:14px;color:var(--text-muted);text-decoration:line-through;">₹${old.toLocaleString()}</span>
          <span style="background:var(--primary-light);color:var(--primary);font-size:12px;font-weight:700;padding:3px 10px;border-radius:99px;">${disc}% OFF</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-muted);">
          <i class="fa-solid fa-star" style="color:#f59e0b;"></i>
          <strong style="color:var(--text);">${p.rating||4.3}</strong>
          <span>(${p.reviews||100} reviews)</span>
        </div>
        ${p.sizes&&p.sizes.length ? `
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <p style="font-size:12px;font-weight:700;color:var(--text);text-transform:uppercase;letter-spacing:.06em;">Select Size</p>
            ${(window.ShopRatings?.getSizeGuideType(p)) ? `<button class="size-guide-btn" onclick="openSizeGuide(${p.id})"><i class="fa-solid fa-ruler"></i> Size Guide</button>` : ''}
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;" id="modalSizes">
            ${p.sizes.map((s,i)=>`
            <button onclick="this.parentElement.querySelectorAll('button').forEach(b=>{b.style.borderColor='var(--border)';b.style.background='var(--white)';b.style.color='var(--text)'}); this.style.borderColor='var(--primary)';this.style.background='var(--primary-light)';this.style.color='var(--primary)';"
              style="padding:8px 14px;border-radius:8px;border:1.5px solid ${i===0?'var(--primary)':'var(--border)'};background:${i===0?'var(--primary-light)':'var(--white)'};color:${i===0?'var(--primary)':'var(--text)'};font-size:13px;font-weight:600;cursor:pointer;transition:.15s;">
              ${s}</button>`).join('')}
          </div>
        </div>` : ''}
        <button onclick="handleAddToCart(${id},'${n}',${p.price},'${p.image}');closeModal();"
          style="margin-top:6px;padding:14px;background:var(--primary);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background .2s;font-family:inherit;">
          <i class="fa-solid fa-bag-shopping"></i> Add to Cart
        </button>
        <button id="modalWishBtn" onclick="handleWishlist(${id},true)"
          style="padding:12px;background:var(--white);border:1.5px solid ${liked?'var(--primary)':'var(--border)'};border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;color:${liked?'var(--primary)':'var(--text)'};display:flex;align-items:center;justify-content:center;gap:8px;transition:.2s;font-family:inherit;background:${liked?'var(--primary-light)':'var(--white)'};">
          <i class="fa-${liked?'solid':'regular'} fa-heart" style="color:var(--primary);"></i>
          ${liked?'Remove from Wishlist':'Add to Wishlist'}
        </button>
        ${window.ShopRatings ? window.ShopRatings.buildRatingWidget(id, p.name) : ''}
      </div>
    </div>`;

  overlay.addEventListener('click', e => { if (e.target===overlay) closeModal(); });
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  if (!document.getElementById('modalAnim')) {
    const s = document.createElement('style');
    s.id = 'modalAnim';
    s.textContent = '@keyframes fadeIn{from{opacity:0}to{opacity:1}}';
    document.head.appendChild(s);
  }
}

function closeModal() {
  document.getElementById('productModal')?.remove();
  document.body.style.overflow = '';
}
window.closeModal        = closeModal;
window.openProductModal  = openProductModal;

/* ════════════ WISHLIST ════════════ */
async function handleWishlist(id, fromModal=false) {
  const inList = wishlist.includes(id);
  if (isLoggedIn()) {
    try {
      const data = await toggleWishlistAPI(id);
      wishlist = data.wishlist;
      localStorage.setItem('shophub_wishlist', JSON.stringify(wishlist));
      showToast(data.message);
    } catch { toggleLocal(id, inList); }
  } else {
    toggleLocal(id, inList);
    showToast(inList ? 'Removed from wishlist' : 'Added to wishlist ❤️');
  }
  if (fromModal) {
    const btn = document.getElementById('modalWishBtn');
    const now = wishlist.includes(id);
    if (btn) {
      btn.innerHTML = `<i class="fa-${now?'solid':'regular'} fa-heart" style="color:var(--primary);"></i> ${now?'Remove from Wishlist':'Add to Wishlist'}`;
      btn.style.borderColor = now?'var(--primary)':'var(--border)';
      btn.style.color       = now?'var(--primary)':'var(--text)';
      btn.style.background  = now?'var(--primary-light)':'var(--white)';
    }
  }
  renderProducts(getFiltered());
}
window.handleWishlist = handleWishlist;

function toggleLocal(id, inList) {
  wishlist = inList ? wishlist.filter(x=>x!==id) : [...wishlist, id];
  localStorage.setItem('shophub_wishlist', JSON.stringify(wishlist));
}

/* ════════════ RECENTLY VIEWED ════════════ */
function renderRecentlyViewed() {
  ['recentlyViewedSection','recentlyViewedSectionAlt'].forEach(secId => {
    const section = document.getElementById(secId);
    const gridId  = secId === 'recentlyViewedSection' ? 'recentlyGrid' : 'recentlyGridAlt';
    const grid    = document.getElementById(gridId);
    if (!section || !grid) return;
    const products = recentlyViewed.map(id=>allProducts.find(p=>p.id===id)).filter(Boolean).slice(0,8);
    if (!products.length) { section.style.display='none'; return; }
    section.style.display = 'block';
    grid.innerHTML = products.map(p=>`
      <div class="recently-card" onclick="openProductModal(${p.id})">
        <img src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src='https://placehold.co/300x300/fef0ee/E8503A?text=ShopHub'">
        <p>${p.name}</p>
      </div>`).join('');
  });
}

/* ════════════ ADD TO CART ════════════ */
async function handleAddToCart(id, name, price, image) {
  if (isBackend) {
    try {
      const data = await addToCartAPI(id, 1);
      cart = data.items;
      saveCart();
      updateCartUI();
      showToast(`${name} added! 🛍️`);
      openCart();
      return;
    } catch {}
  }
  const ex = cart.find(i => i.productId===id);
  if (ex) ex.quantity++;
  else cart.push({ productId:id, name, price, image, quantity:1 });
  saveCart(); updateCartUI();
  showToast(`${name} added! 🛍️`);
  openCart();
}
window.handleAddToCart = handleAddToCart;

async function handleRemoveFromCart(id) {
  if (isBackend) {
    try { const d=await removeFromCartAPI(id); cart=d.items; saveCart(); updateCartUI(); return; } catch {}
  }
  cart = cart.filter(i=>i.productId!==id);
  saveCart(); updateCartUI();
}
window.handleRemoveFromCart = handleRemoveFromCart;

async function handleUpdateQty(id, delta) {
  const item = cart.find(i=>i.productId===id);
  if (!item) return;
  const newQ = item.quantity + delta;
  if (newQ <= 0) { handleRemoveFromCart(id); return; }
  if (isBackend) {
    try { const d=await updateCartItemAPI(id,newQ); cart=d.items; saveCart(); updateCartUI(); return; } catch {}
  }
  item.quantity = newQ;
  saveCart(); updateCartUI();
}
window.handleUpdateQty = handleUpdateQty;

function saveCart() { localStorage.setItem('shophub_cart', JSON.stringify(cart)); }

/* ════════════ CART UI ════════════ */
function updateCartUI() {
  const total = cart.reduce((s,i)=>s+i.price*i.quantity, 0);
  const count = cart.reduce((s,i)=>s+i.quantity, 0);
  const badge   = document.getElementById('cartBadge');
  const countEl = document.getElementById('cartCount');
  const totalEl = document.getElementById('cartTotal');
  const itemsEl = document.getElementById('cartItems');
  if (badge)   { badge.textContent=count; badge.classList.toggle('show',count>0); }
  if (countEl) countEl.textContent = count;
  if (totalEl) totalEl.textContent = `₹${total.toLocaleString()}`;
  if (!itemsEl) return;
  if (!cart.length) {
    itemsEl.innerHTML=`<div class="cart-empty"><i class="fa-solid fa-bag-shopping"></i><p>Your cart is empty</p><small style="color:var(--text-muted);font-size:13px;">Browse and add items!</small></div>`; return;
  }
  itemsEl.innerHTML = cart.map(item=>`
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.onerror=null;this.src='https://placehold.co/80x80/fef0ee/E8503A?text=ShopHub'">
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <span class="cart-item-price">₹${(item.price*item.quantity).toLocaleString()}</span>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="handleUpdateQty(${item.productId},-1)">−</button>
          <span class="qty-num">${item.quantity}</span>
          <button class="qty-btn" onclick="handleUpdateQty(${item.productId},1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="handleRemoveFromCart(${item.productId})">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>`).join('');
}

function openCart() {
  document.getElementById('cartSidebar')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cartSidebar')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ════════════ IMAGE SUGGESTION ════════════ */
window.handleImageUpload = async function(input) {
  const file = input.files[0];
  if (!file) return;

  const resultEl = document.getElementById('suggestionResults');
  const section  = document.getElementById('suggestionSection');
  if (!resultEl || !section) return;

  section.style.display = 'block';
  resultEl.innerHTML = '<p style="color:var(--text-muted);font-size:14px;text-align:center;padding:20px;">🤖 Analyzing your image…</p>';

  // Extract keywords from filename and file type
  const fileName = file.name.toLowerCase();
  const keywords = [];

  // Color detection from filename
  const colors = ['red','blue','green','black','white','pink','yellow','grey','gray','brown','beige','navy','olive','purple','orange'];
  colors.forEach(c => { if (fileName.includes(c)) keywords.push(c); });

  // Item type from filename
  const items = ['dress','shirt','jeans','shoes','boots','bag','jacket','coat','top','pants','skirt','sneakers','heels','watch','glasses'];
  items.forEach(i => { if (fileName.includes(i)) keywords.push(i); });

  // Category hints
  let category = '';
  if (['dress','skirt','blouse','heels'].some(w=>fileName.includes(w))) category = 'Women';
  else if (['suit','tie','blazer'].some(w=>fileName.includes(w)))       category = 'Men';
  else if (['shoes','boots','sneakers'].some(w=>fileName.includes(w)))  category = 'Footwear';
  else if (['bag','watch','jewellery'].some(w=>fileName.includes(w)))   category = 'Accessories';

  // Default keywords if none found
  if (!keywords.length) keywords.push('casual', 'style', 'fashion');

  // Show preview
  const reader = new FileReader();
  reader.onload = async (e) => {
    const previewEl = document.getElementById('imagePreview');
    if (previewEl) { previewEl.src=e.target.result; previewEl.style.display='block'; }

    try {
      let suggestions;
      if (isBackend) {
        const data = await fetchSuggestions({ keywords, category, fileName: file.name });
        suggestions = data.suggestions;
      } else {
        // Offline fallback: filter allProducts by keywords
        suggestions = allProducts
          .filter(p => {
            const h = [p.name,p.category,p.brand||'',...(p.tags||[])].join(' ').toLowerCase();
            return keywords.some(k=>h.includes(k)) || (category && p.category===category);
          })
          .sort((a,b)=>b.rating-a.rating)
          .slice(0,8);
        if (!suggestions.length) suggestions = [...allProducts].sort((a,b)=>b.rating-a.rating).slice(0,8);
      }

      resultEl.innerHTML = `
        <p style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:14px;">
          🎯 ${suggestions.length} suggestions based on your image
          ${keywords.length?`<span style="font-size:12px;color:var(--text-muted);font-weight:400;"> · Keywords: ${keywords.join(', ')}</span>`:''}
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;">
          ${suggestions.map(p=>`
            <div onclick="openProductModal(${p.id})" style="cursor:pointer;border-radius:12px;overflow:hidden;border:1px solid var(--border);background:var(--white);transition:.2s;" onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,.1)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
              <img src="${p.image}" alt="${p.name}" style="width:100%;height:150px;object-fit:cover;" onerror="this.onerror=null;this.src='https://placehold.co/300x150/fef0ee/E8503A?text=ShopHub'">
              <div style="padding:10px;">
                <p style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:3px;line-height:1.3;">${p.name}</p>
                <p style="font-size:13px;font-weight:700;color:var(--primary);">₹${p.price.toLocaleString()}</p>
              </div>
            </div>`).join('')}
        </div>`;
    } catch {
      resultEl.innerHTML = '<p style="color:#b91c1c;font-size:14px;">Could not load suggestions. Please try again.</p>';
    }
  };
  reader.readAsDataURL(file);
};

/* ════════════ WIRE BUTTONS ════════════ */
function wireButtons() {
  // Browse Trends
  document.querySelector('.hero-btn-secondary')?.addEventListener('click', () =>
    document.getElementById('productsSection')?.scrollIntoView({ behavior:'smooth' }));

  // Checkout btn
  document.querySelector('.checkout-btn')?.addEventListener('click', () => {
    if (!cart.length) { showToast('Add items first! 🛍️'); return; }
    window.location.href = 'checkout.html';
  });

  // Cart toggle
  document.getElementById('cartToggle')?.addEventListener('click', openCart);
  document.getElementById('cartClose')?.addEventListener('click',  closeCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);

  // Sort
  document.getElementById('sortSelect')?.addEventListener('change', e => {
    currentSort = e.target.value;
    renderProducts(getFiltered());
  });

  // Voice search
  document.getElementById('voiceBtn')?.addEventListener('click', startVoiceSearch);

  // Newsletter
  document.getElementById('newsletterForm')?.addEventListener('submit', e => {
    e.preventDefault(); showToast('Subscribed! 🎉'); e.target.reset();
  });

  // Scroll arrows
  document.getElementById('scrollLeft')?.addEventListener('click',  () => document.getElementById('productGrid')?.scrollBy({left:-300,behavior:'smooth'}));
  document.getElementById('scrollRight')?.addEventListener('click', () => document.getElementById('productGrid')?.scrollBy({left:300,behavior:'smooth'}));

  // Filter tabs
  document.getElementById('filterTabs')?.addEventListener('click', e => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    document.querySelectorAll('.filter-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    renderProducts(getFiltered());
  });

  // Category cards
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      currentFilter = card.dataset.category;
      document.querySelectorAll('.filter-tab').forEach(t=>t.classList.toggle('active',t.dataset.filter===currentFilter));
      renderProducts(getFiltered());
      document.getElementById('productsSection')?.scrollIntoView({behavior:'smooth'});
    });
  });

  // ✅ FIX 2: Single, clean search listener on the desktop input.
  // Removed duplicate listeners and debug console.log statements.
  // Now syncs desktop ↔ mobile inputs and re-renders in real time.
  const searchInput = document.getElementById('searchInput');
  const mobileSearchInput = document.getElementById('mobileSearchInput');

  searchInput?.addEventListener('input', () => {
    // FIX: Update currentSearch state so getFiltered uses single source of truth
    currentSearch = searchInput.value;
    if (mobileSearchInput) mobileSearchInput.value = searchInput.value;
    renderProducts(getFiltered());
    updateSearchClear();
    // Auto-scroll to products section when user types a search query
    if (currentSearch.trim().length === 1) {
      // Only scroll on first character to avoid jumping while typing
      document.getElementById('productsSection')?.scrollIntoView({ behavior: 'smooth' });
    }
  });
  
  // FIX: Add clear button support
  function updateSearchClear() {
    const clearBtn = document.getElementById('searchClearBtn');
    if (clearBtn) clearBtn.style.display = currentSearch ? 'flex' : 'none';
  }
  const clearBtn = document.getElementById('searchClearBtn');
  clearBtn?.addEventListener('click', () => {
    currentSearch = '';
    if (searchInput) searchInput.value = '';
    if (mobileSearchInput) mobileSearchInput.value = '';
    renderProducts(getFiltered());
    updateSearchClear();
    searchInput?.focus();
  });

  // Mobile search toggle
  document.getElementById('mobileSearch')?.addEventListener('click', () => {
    const bar = document.getElementById('mobileSearchBar');
    if (!bar) return;
    const show = bar.style.display === 'block';
    bar.style.display = show ? 'none' : 'block';
    if (!show) mobileSearchInput?.focus();
  });

  // ✅ FIX 3: Mobile input syncs back to desktop and triggers filter correctly.
  // Removed the old debounce-only version that didn't sync the desktop value.
  mobileSearchInput?.addEventListener('input', () => {
    // FIX: Update currentSearch state and sync desktop input
    currentSearch = mobileSearchInput.value;
    if (searchInput) searchInput.value = mobileSearchInput.value;
    renderProducts(getFiltered());
    if (currentSearch.trim().length === 1) {
      document.getElementById('productsSection')?.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Scroll effects
  window.addEventListener('scroll', () => {
    document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY>20);
    document.getElementById('scrollTop')?.classList.toggle('visible', window.scrollY>400);
  });
  document.getElementById('scrollTop')?.addEventListener('click', ()=>window.scrollTo({top:0,behavior:'smooth'}));

  // Animate on scroll
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; }
    });
  }, { threshold:0.1 });
  document.querySelectorAll('.category-card,.feature-item').forEach(el => {
    el.style.cssText='opacity:0;transform:translateY(20px);transition:opacity .6s ease,transform .6s ease';
    obs.observe(el);
  });
}

/* ════════════ VOICE SEARCH ════════════ */
function startVoiceSearch() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showToast('Voice search not supported in this browser'); return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const r  = new SR();
  r.lang = 'en-IN';
  const btn = document.getElementById('voiceBtn');
  btn?.classList.add('listening');
  showToast('🎤 Listening…');
  r.onresult = e => {
    const t = e.results[0][0].transcript;
    const inp = document.getElementById('searchInput');
    const mob = document.getElementById('mobileSearchInput');
    // FIX: Update state and both inputs
    currentSearch = t;
    if (inp) inp.value = t;
    if (mob) mob.value = t;
    renderProducts(getFiltered());
    showToast(`Searching: "${t}"`);
    btn?.classList.remove('listening');
  };
  r.onerror = () => { btn?.classList.remove('listening'); showToast('Voice search failed.'); };
  r.onend   = () => btn?.classList.remove('listening');
  r.start();
}

/* ════════════ TOAST ════════════ */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  const x = document.getElementById('toastMsg');
  if (!t||!x) return;
  clearTimeout(toastTimer);
  x.textContent = msg;
  t.classList.add('show');
  toastTimer = setTimeout(()=>t.classList.remove('show'), 2800);
}

/* ════════════ HELPERS ════════════ */
function debounce(fn, ms) { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; }

function showStatus(msg, type) {
  let el = document.querySelector('.connection-status');
  if (!el) { el=document.createElement('div'); el.className='connection-status'; document.body.appendChild(el); }
  el.textContent=msg; el.className=`connection-status ${type} show`;
  setTimeout(()=>el.classList.remove('show'), 3500);
}

// Footer helpers
window.filterByCategory = function(cat) {
  currentFilter = cat;
  document.querySelectorAll('.filter-tab').forEach(t=>t.classList.toggle('active',t.dataset.filter===cat));
  renderProducts(getFiltered());
  document.getElementById('productsSection')?.scrollIntoView({behavior:'smooth'});
};
window.resetFilter = function() {
  currentFilter = 'all'; currentSort = ''; currentSearch = '';
  document.querySelectorAll('.filter-tab').forEach(t=>t.classList.toggle('active',t.dataset.filter==='all'));
  const ss = document.getElementById('sortSelect'); if(ss) ss.value = '';
  const si = document.getElementById('searchInput'); if(si) si.value = '';
  const mi = document.getElementById('mobileSearchInput'); if(mi) mi.value = '';
  const cb = document.getElementById('searchClearBtn'); if(cb) cb.style.display = 'none';
  renderProducts(getFiltered());
  document.getElementById('productsSection')?.scrollIntoView({behavior:'smooth'});
};
