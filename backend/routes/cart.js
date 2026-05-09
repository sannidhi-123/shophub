/**
 * ============================================
 * routes/cart.js — Cart API Routes
 * ============================================
 * 
 * Handles all cart-related endpoints:
 * 
 * GET    /api/cart              → Get cart contents
 * POST   /api/cart              → Add item to cart
 * PUT    /api/cart/:productId   → Update item quantity
 * DELETE /api/cart/:productId   → Remove item from cart
 * DELETE /api/cart              → Clear entire cart
 * 
 * Cart data is stored in data/cart.json
 * ============================================
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Paths to our JSON "database" files
const CART_FILE = path.join(__dirname, '..', 'data', 'cart.json');
const PRODUCTS_FILE = path.join(__dirname, '..', 'data', 'products.json');

/**
 * Helper: Read cart from JSON file
 */
function getCart() {
  const raw = fs.readFileSync(CART_FILE, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Helper: Save cart to JSON file
 */
function saveCart(cartData) {
  cartData.updatedAt = new Date().toISOString();
  fs.writeFileSync(CART_FILE, JSON.stringify(cartData, null, 2));
}

/**
 * Helper: Get all products (to look up product details)
 */
function getProducts() {
  const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Helper: Calculate cart totals
 */
function calculateTotals(items) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { totalItems, totalPrice };
}

/* ============================================
   GET /api/cart
   
   Returns the current cart with all items
   and calculated totals.
============================================ */
router.get('/', (req, res) => {
  try {
    const cart = getCart();
    const totals = calculateTotals(cart.items);

    res.json({
      success: true,
      items: cart.items,
      totalItems: totals.totalItems,
      totalPrice: totals.totalPrice,
      updatedAt: cart.updatedAt,
    });
  } catch (error) {
    console.error('Error reading cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load cart',
    });
  }
});

/* ============================================
   POST /api/cart
   
   Add a product to the cart.
   
   Request body:
   {
     "productId": 1,
     "quantity": 1    (optional, defaults to 1)
   }
   
   If the product is already in the cart,
   its quantity is increased.
============================================ */
router.post('/', (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate input
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'productId is required',
      });
    }

    // Find the product in our database
    const products = getProducts();
    const product = products.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product with ID ${productId} not found`,
      });
    }

    // Read current cart
    const cart = getCart();

    // Check if product is already in cart
    const existingItem = cart.items.find(item => item.productId === productId);

    if (existingItem) {
      // Increase quantity
      existingItem.quantity += quantity;
    } else {
      // Add new item to cart with product details
      cart.items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: quantity,
      });
    }

    // Save updated cart
    saveCart(cart);

    const totals = calculateTotals(cart.items);

    res.status(201).json({
      success: true,
      message: `${product.name} added to cart`,
      items: cart.items,
      totalItems: totals.totalItems,
      totalPrice: totals.totalPrice,
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add item to cart',
    });
  }
});

/* ============================================
   PUT /api/cart/:productId
   
   Update the quantity of a cart item.
   
   Request body:
   {
     "quantity": 3
   }
============================================ */
router.put('/:productId', (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const { quantity } = req.body;

    // Validate input
    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid quantity is required (0 or greater)',
      });
    }

    const cart = getCart();

    // Find the item in the cart
    const itemIndex = cart.items.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: `Product ${productId} is not in the cart`,
      });
    }

    if (quantity === 0) {
      // Remove the item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Update the quantity
      cart.items[itemIndex].quantity = quantity;
    }

    saveCart(cart);

    const totals = calculateTotals(cart.items);

    res.json({
      success: true,
      message: 'Cart updated',
      items: cart.items,
      totalItems: totals.totalItems,
      totalPrice: totals.totalPrice,
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update cart',
    });
  }
});

/* ============================================
   DELETE /api/cart/:productId
   
   Remove a specific product from the cart.
============================================ */
router.delete('/:productId', (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const cart = getCart();

    // Check if item exists in cart
    const itemIndex = cart.items.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: `Product ${productId} is not in the cart`,
      });
    }

    // Remove the item
    const removedItem = cart.items.splice(itemIndex, 1)[0];
    saveCart(cart);

    const totals = calculateTotals(cart.items);

    res.json({
      success: true,
      message: `${removedItem.name} removed from cart`,
      items: cart.items,
      totalItems: totals.totalItems,
      totalPrice: totals.totalPrice,
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from cart',
    });
  }
});

/* ============================================
   DELETE /api/cart
   
   Clear the entire cart (remove all items).
============================================ */
router.delete('/', (req, res) => {
  try {
    const cart = { items: [], updatedAt: null };
    saveCart(cart);

    res.json({
      success: true,
      message: 'Cart cleared',
      items: [],
      totalItems: 0,
      totalPrice: 0,
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart',
    });
  }
});

module.exports = router;