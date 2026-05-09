/**
 * api.js — ShopHub v3.0 API Layer
 * All backend calls in one place.
 * Auto-detects backend URL (localhost:3000 or relative).
 */

const API_BASE = (function() {
  if (window.location.port === '3000' || window.location.hostname !== 'localhost' && window.location.protocol !== 'file:') {
    return '/api';
  }
  return 'http://localhost:3000/api';
})();

/* ── Core request ── */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('shophub_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res  = await fetch(`${API_BASE}${endpoint}`, { headers, ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

/* ── Auth ── */
async function signupAPI(name, email, password) {
  return apiRequest('/auth/signup', { method:'POST', body:JSON.stringify({ name, email, password }) });
}
async function loginAPI(email, password) {
  return apiRequest('/auth/login', { method:'POST', body:JSON.stringify({ email, password }) });
}
async function getMeAPI()              { return apiRequest('/auth/me'); }
async function updateProfileAPI(data)  { return apiRequest('/auth/profile', { method:'PUT', body:JSON.stringify(data) }); }
async function toggleWishlistAPI(id)   { return apiRequest(`/auth/wishlist/${id}`, { method:'POST' }); }
async function addRecentlyViewedAPI(id){ try { await apiRequest(`/auth/recently-viewed/${id}`, { method:'POST' }); } catch {} }

/* ── Products ── */
async function fetchProducts(params={}) {
  const qs = new URLSearchParams(params).toString();
  return (await apiRequest(`/products${qs?'?'+qs:''}`)).products;
}
async function fetchProductById(id)   { return (await apiRequest(`/products/${id}`)).product; }
async function fetchTrending()         { return (await apiRequest('/products/trending')).products; }
async function fetchSuggestions(data)  {
  return apiRequest('/products/suggest', { method:'POST', body:JSON.stringify(data) });
}

/* ── Cart ── */
async function fetchCart()                      { return apiRequest('/cart'); }
async function addToCartAPI(productId, qty=1)   { return apiRequest('/cart', { method:'POST', body:JSON.stringify({ productId, quantity:qty }) }); }
async function updateCartItemAPI(productId, qty){ return apiRequest(`/cart/${productId}`, { method:'PUT', body:JSON.stringify({ quantity:qty }) }); }
async function removeFromCartAPI(productId)     { return apiRequest(`/cart/${productId}`, { method:'DELETE' }); }
async function clearCartAPI()                   { return apiRequest('/cart', { method:'DELETE' }); }

/* ── Order ── */
async function placeOrderAPI(name, address, items, total) {
  return apiRequest('/order', { method:'POST', body:JSON.stringify({ name, address, items, total }) });
}

/* ── Local helpers ── */
function getCurrentUser() { return JSON.parse(localStorage.getItem('shophub_user') || 'null'); }
// ✅ FIX: Check both token AND user data. Offline logins store "offline"
// as the token value — still truthy. This double-check also catches any
// edge case where token was cleared but user data remains (or vice versa).
function isLoggedIn()     { return !!localStorage.getItem('shophub_token') && !!localStorage.getItem('shophub_user'); }
function logoutUser()     { localStorage.removeItem('shophub_token'); localStorage.removeItem('shophub_user'); }
