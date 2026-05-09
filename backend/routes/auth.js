const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/signup',                        ctrl.signup);
router.post('/login',                         ctrl.login);
router.get('/me',                             authenticateToken, ctrl.getMe);
router.put('/profile',                        authenticateToken, ctrl.updateProfile);
router.post('/wishlist/:productId',           authenticateToken, ctrl.toggleWishlist);
router.post('/recently-viewed/:productId',    authenticateToken, ctrl.addRecentlyViewed);

module.exports = router;
