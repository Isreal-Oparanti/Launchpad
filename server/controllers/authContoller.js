const User = require('../models/User');
const { jwtUtils } = require('../utils/jwt');
const validator = require('validator');

class AuthController {
  async register(req, res) {
    try {
      const { email, password, fullName, school, major } = req.body;

      const errors = {};
      
      if (!email || !validator.isEmail(email)) {
        errors.email = 'Valid email is required';
      }
      
      if (!password || password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      if (!fullName || fullName.trim().length === 0) {
        errors.fullName = 'Full name is required';
      }
      
      if (!school || school.trim().length === 0) {
        errors.school = 'School is required';
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }

      const existingUser = await User.findByEmailOrGoogle(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      const userData = {
        email: email.toLowerCase().trim(),
        password,
        fullName: fullName.trim(),
        school: school.trim(),
        major: major?.trim() || null,
        termsAccepted: true,
        termsAcceptedAt: new Date()
      };

      const user = await User.createUser(userData);
      const tokens = jwtUtils.generateTokens(user);
      jwtUtils.setAuthCookies(res, tokens);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          school: user.school,
          major: user.major,
          profilePicture: user.profilePicture,
          isEmailVerified: user.isEmailVerified,
          profileCompleted: user.profileCompleted,
          role: user.role,
          createdAt: user.createdAt
        },
        tokens: {
          accessToken: tokens.accessToken,
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const user = await User.findOne({ 
        email: email.toLowerCase().trim() 
      }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const tokens = jwtUtils.generateTokens(user);
      jwtUtils.setAuthCookies(res, tokens);

      user.lastLogin = new Date();
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          school: user.school,
          major: user.major,
          profilePicture: user.profilePicture,
          isEmailVerified: user.isEmailVerified,
          profileCompleted: user.profileCompleted,
          role: user.role,
          lastLogin: user.lastLogin
        },
        tokens: {
          accessToken: tokens.accessToken,
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed. Please try again.',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }

 
  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token not found'
        });
      }

      const decoded = jwtUtils.verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      const tokens = jwtUtils.generateTokens(user);
      jwtUtils.setAuthCookies(res, tokens);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        accessToken: tokens.accessToken
      });

    } catch (error) {
      console.error('Token refresh error:', error);
      jwtUtils.clearAuthCookies(res);
      
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  }
}