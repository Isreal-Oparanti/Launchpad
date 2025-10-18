const User = require('../models/User');
const { jwtUtils } = require('../utils/jwt');
const emailService = require('../utils/email');
const validator = require('validator');

class AuthController {
  async register(req, res) {
    try {
      const { email, password, fullName, username, school, major } = req.body;

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
      
      if (!username || username.trim().length < 3) {
        errors.username = 'Username must be at least 3 characters';
      } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.username = 'Username can only contain letters, numbers, and underscores';
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

      const userData = {
        email: email.toLowerCase().trim(),
        password,
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        school: school.trim(),
        major: major?.trim() || null,
        termsAccepted: true,
        termsAcceptedAt: new Date()
      };

      const user = await User.createUser(userData);
      
      // Generate and send verification code
      const verificationCode = user.generateVerificationCode();
      await user.save();
      
      const emailSent = await emailService.sendVerificationCode(
        user.email, 
        verificationCode, 
        user.fullName
      );

      if (!emailSent) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification email. Please try again.'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Registration successful. Check your email for verification code.',
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          school: user.school,
          major: user.major,
          isEmailVerified: user.isEmailVerified,
          profileCompleted: user.profileCompleted,
          role: user.role,
          createdAt: user.createdAt
        },
        requiresVerification: true
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        const message = field === 'username' 
          ? 'Username already taken' 
          : 'User already exists with this email';
        
        return res.status(409).json({
          success: false,
          message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Registration failed. Please try again.',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          success: false,
          message: 'Email and verification code are required'
        });
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() })
        .select('+emailVerificationCode +emailVerificationCodeExpires');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified'
        });
      }

      const isValid = user.verifyEmailCode(code);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification code'
        });
      }

      await user.save();

      // Generate tokens after successful verification
      const tokens = jwtUtils.generateTokens(user);
      jwtUtils.setAuthCookies(res, tokens);

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          school: user.school,
          major: user.major,
          profilePicture: user.profilePicture,
          isEmailVerified: user.isEmailVerified,
          profileCompleted: user.profileCompleted,
          role: user.role,
          initials: user.initials
        },
        tokens: {
          accessToken: tokens.accessToken,
        }
      });

    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Email verification failed',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }

  async resendVerificationCode(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() })
        .select('+emailVerificationCode +emailVerificationCodeExpires');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified'
        });
      }

      const verificationCode = user.generateVerificationCode();
      await user.save();

      const emailSent = await emailService.sendVerificationCode(
        user.email, 
        verificationCode, 
        user.fullName
      );

      if (!emailSent) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification email'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Verification code sent successfully'
      });

    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend verification code'
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

      // Check if email is verified
      if (!user.isEmailVerified) {
        return res.status(403).json({
          success: false,
          message: 'Please verify your email before logging in',
          code: 'EMAIL_NOT_VERIFIED',
          requiresVerification: true
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
          username: user.username,
          fullName: user.fullName,
          school: user.school,
          major: user.major,
          profilePicture: user.profilePicture,
          isEmailVerified: user.isEmailVerified,
          profileCompleted: user.profileCompleted,
          role: user.role,
          lastLogin: user.lastLogin,
          initials: user.initials
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

  async logout(req, res) {
    try {
      jwtUtils.clearAuthCookies(res);
      
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }

  async getProfile(req, res) {
    try {
      res.status(200).json({
        success: true,
        user: req.user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const { fullName, username, school, major, profilePicture, bio } = req.body;
      const user = await User.findById(req.user.id);

      const errors = {};
      
      // Validate username if provided
      if (username && username !== user.username) {
        if (username.trim().length < 3) {
          errors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          errors.username = 'Username can only contain letters, numbers, and underscores';
        } else {
          // Check if username is taken
          const existingUser = await User.findOne({ 
            username: username.trim().toLowerCase(),
            _id: { $ne: user._id }
          });
          if (existingUser) {
            errors.username = 'Username already taken';
          }
        }
      }

      if (fullName && (!fullName.trim() || fullName.trim().length === 0)) {
        errors.fullName = 'Full name is required';
      }
      
      if (school && (!school.trim() || school.trim().length === 0)) {
        errors.school = 'School is required';
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }

      // Update fields if provided
      if (fullName) user.fullName = fullName.trim();
      if (username && !errors.username) user.username = username.trim().toLowerCase();
      if (school) user.school = school.trim();
      if (major !== undefined) user.major = major?.trim() || null;
      if (profilePicture !== undefined) user.profilePicture = profilePicture;
      if (bio !== undefined) user.bio = bio?.trim() || null;

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          school: user.school,
          major: user.major,
          profilePicture: user.profilePicture,
          bio: user.bio,
          isEmailVerified: user.isEmailVerified,
          profileCompleted: user.profileCompleted,
          role: user.role,
          initials: user.initials
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(e => e.message)
        });
      }
      
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Username already taken'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }

  async checkAuth(req, res) {
    try {
      res.status(200).json({
        success: true,
        authenticated: true,
        user: req.user
      });
    } catch (error) {
      console.error('Check auth error:', error);
      res.status(500).json({
        success: false,
        message: 'Authentication check failed'
      });
    }
  }
}

module.exports = AuthController;