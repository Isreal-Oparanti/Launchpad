  const jwt = require('jsonwebtoken');
  const User = require('../models/User');

  class JWTUtils {
    constructor() {
      this.accessTokenSecret = process.env.JWT_ACCESS_SECRET;
      this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
      this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
      this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
      
      if (!this.accessTokenSecret || !this.refreshTokenSecret) {
        throw new Error('JWT secrets are not configured');
      }
    }

    generateAccessToken(user) {
      const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      };

      return jwt.sign(payload, this.accessTokenSecret, {
        expiresIn: this.accessTokenExpiry,
        issuer: 'launchpad-api',
        audience: 'launchpad-client'
      });
    }

    generateRefreshToken(user) {
      const payload = {
        id: user._id,
        tokenVersion: user.tokenVersion || 1
      };

      return jwt.sign(payload, this.refreshTokenSecret, {
        expiresIn: this.refreshTokenExpiry,
        issuer: 'launchpad-api',
        audience: 'launchpad-client'
      });
    }

    generateTokens(user) {
      return {
        accessToken: this.generateAccessToken(user),
        refreshToken: this.generateRefreshToken(user)
      };
    }

    verifyAccessToken(token) {
      try {
        return jwt.verify(token, this.accessTokenSecret, {
          issuer: 'launchpad-api',
          audience: 'launchpad-client'
        });
      } catch (error) {
        throw new Error(`Invalid access token: ${error.message}`);
      }
    }

    verifyRefreshToken(token) {
      try {
        return jwt.verify(token, this.refreshTokenSecret, {
          issuer: 'launchpad-api',
          audience: 'launchpad-client'
        });
      } catch (error) {
        throw new Error(`Invalid refresh token: ${error.message}`);
      }
    }

    extractTokenFromRequest(req) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
      }

      if (req.cookies && req.cookies.accessToken) {
        return req.cookies.accessToken;
      }

      return null;
    }

    setAuthCookies(res, tokens) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Common cookie options for production cross-origin setup
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction, // Must be true in production for sameSite: 'none'
    sameSite: isProduction ? 'none' : 'lax', // 'none' allows cross-origin cookies
    path: '/',
  };
  
  res.cookie('accessToken', tokens.accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

clearAuthCookies(res) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.clearCookie('accessToken', { 
    path: '/',
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction
  });
  
  res.clearCookie('refreshToken', { 
    path: '/',
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction
  });
}
  }
  const jwtUtils = new JWTUtils();

const authenticate = async (req, res, next) => {
  try {
    const token = jwtUtils.extractTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }
    const decoded = jwtUtils.verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token', code: 'INVALID_TOKEN' });
    }
    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

  const optionalAuth = async (req, res, next) => {
    try {
      const token = jwtUtils.extractTokenFromRequest(req);
      
      if (token) {
        const decoded = jwtUtils.verifyAccessToken(token);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user) {
          req.user = user;
          req.token = token;
        }
      }
      
      next();
    } catch (error) {
      next();
    }
  };

  const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    next();
  };

  const requireEmailVerification = (req, res, next) => {
    if (!req.user || !req.user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email verification required',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }
    next();
  };

  const createAuthRateLimit = (windowMs, max) => {
    const attempts = new Map();
    
    return (req, res, next) => {
      const key = req.ip + (req.body.email || '');
      const now = Date.now();
      const windowStart = now - windowMs;
      
      for (const [entryKey, entry] of attempts.entries()) {
        if (entry.timestamp < windowStart) {
          attempts.delete(entryKey);
        }
      }
      
      const userAttempts = attempts.get(key) || { count: 0, timestamp: now };
      
      if (userAttempts.count >= max) {
        return res.status(429).json({
          success: false,
          message: 'Too many attempts. Please try again later.',
          retryAfter: Math.ceil((userAttempts.timestamp + windowMs - now) / 1000)
        });
      }
      
      attempts.set(key, {
        count: userAttempts.count + 1,
        timestamp: userAttempts.timestamp
      });
      
      next();
    };
  };

  module.exports = {
    jwtUtils,
    authenticate,
    optionalAuth,
    requireAdmin,
    requireEmailVerification,
    createAuthRateLimit
  };