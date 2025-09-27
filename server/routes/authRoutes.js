const express = require('express');
const AuthController = require('../controllers/authController');
const { 
  authenticate, 
  optionalAuth, 
  createAuthRateLimit 
} = require('../utils/jwt');

const router = express.Router();
const authController = new AuthController();

const loginRateLimit = createAuthRateLimit(15 * 60 * 1000, 5);
const registerRateLimit = createAuthRateLimit(60 * 60 * 1000, 3);

router.post('/register', registerRateLimit, authController.register.bind(authController));
router.post('/login', loginRateLimit, authController.login.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));
router.post('/logout', optionalAuth, authController.logout.bind(authController));
router.get('/me', authenticate, authController.getProfile.bind(authController));
router.put('/profile', authenticate, authController.updateProfile.bind(authController));
router.get('/check', authenticate, authController.checkAuth.bind(authController));

module.exports = router;