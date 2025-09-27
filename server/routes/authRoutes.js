const express = require('express');
const authController = require('../controllers/authController');
const { 
  authenticate, 
  optionalAuth, 
  createAuthRateLimit 
} = require('../utils/jwt');

const router = express.Router();

// Rate limiting for auth endpoints
const loginRateLimit = createAuthRateLimit(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
const registerRateLimit = createAuthRateLimit(60 * 60 * 1000, 3); // 3 attempts per hour

// ======================
// Email/Password Routes
// ======================

/**
 * POST /auth/register
 * Register new user with email and password
 */
router.post('/register', registerRateLimit, authController.register);

/**
 * POST /auth/login
 * Login user with email and password
 */
router.post('/login', loginRateLimit, authController.login);

// ======================
// Google OAuth Routes
// ======================


// ======================
// Token Management
// ======================

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', authController.refreshToken);

/**
 * POST /auth/logout
 * Logout user and clear tokens
 */
router.post('/logout', optionalAuth, authController.logout);

// ======================
// User Profile Routes
// ======================

/**
 * GET /auth/me
 * Get current user profile (requires authentication)
 */
router.get('/me', authenticate, authController.getProfile);

/**
 * PUT /auth/profile
 * Update user profile (requires authentication)
 */
router.put('/profile', authenticate, authController.updateProfile);

/**
 * GET /auth/check
 * Check authentication status
 */
router.get('/check', authenticate, authController.checkAuth);

module.exports = router;