/**
 * ============================================
 * routes/order.js — Order API Route (NEW)
 * ============================================
 * POST /api/order  { name, address, items, total }
 *
 * Validates the order, saves it to orders.json,
 * then clears the cart.
 * ============================================
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const ORDERS_FILE = path.join(__dirname, '..', 'data', 'orders.json');
const CART_FILE   = path.join(__dirname, '..', 'data', 'cart.json');

// Ensure orders.json exists
function ensureOrdersFile() {
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify({ orders: [] }, null, 2));
  }
}

function getOrders() {
  ensureOrdersFile();
  return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
}

function saveOrders(data) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(data, null, 2));
}

function clearCart() {
  const emptyCart = { items: [], updatedAt: new Date().toISOString() };
  fs.writeFileSync(CART_FILE, JSON.stringify(emptyCart, null, 2));
}

/* ============================================
   POST /api/order
============================================ */
router.post('/', (req, res) => {
  try {
    const { name, address, items, total } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({ success: false, error: 'Delivery address is required.' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty — nothing to order.' });
    }

    // Generate a simple order ID
    const orderId = 'SH' + Date.now();

    const newOrder = {
      orderId,
      name: name.trim(),
      address: address.trim(),
      items,
      total,
      status: 'confirmed',
      placedAt: new Date().toISOString(),
    };

    // Save order
    const data = getOrders();
    data.orders.push(newOrder);
    saveOrders(data);

    // Clear cart after successful order
    clearCart();

    console.log(`✅ Order placed: ${orderId} by ${name}`);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId,
      estimatedDelivery: '3–5 business days',
    });

  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ success: false, error: 'Failed to place order. Please try again.' });
  }
});

module.exports = router;
