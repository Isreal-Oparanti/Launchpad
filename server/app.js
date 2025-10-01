const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

const authRoutes = require('./routes/authRoutes');

// ======================
// Environment Configuration
// ======================
const isProduction = process.env.NODE_ENV === 'production';
const isStaging = process.env.NODE_ENV === 'staging';
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

console.log(`🚀 Starting server in ${process.env.NODE_ENV || 'development'} mode`);

const connectDatabase = async () => {
  try {
    let mongoURI;
    
    if (isProduction) {
      mongoURI = process.env.MONGODB_URI;
      console.log('Using PRODUCTION database');
    } else {
      mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/launchpad-dev';
      console.log('Using DEVELOPMENT database');
    }
    
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined for current environment');
    }

    await mongoose.connect(mongoURI, {
      maxPoolSize: isProduction ? 20 : 10,
      serverSelectionTimeoutMS: isProduction ? 10000 : 5000, 
      socketTimeoutMS: 45000,
    });

    console.log('Connected to MongoDB successfully');
    
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

// ======================
// CORS Configuration
// ======================
const getCorsOptions = () => {
  const baseOrigins = ['http://localhost:3000', 'http://localhost:3001'];
  
  if (isProduction) {
    return {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || [
        'https://launchpadbeta.netlify.app'
      ],
      credentials: true, 
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['Set-Cookie'], 
      maxAge: 86400
    };
  } else {
    return {
      origin: baseOrigins,
      credentials: true, 
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['Set-Cookie'], 
      maxAge: 86400
    };
  }
};

// ======================
// Middleware
// ======================

// Apply CORS middleware FIRST
app.use(cors(getCorsOptions()));

// Helmet for security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  } : false, 
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (isDevelopment) {
  app.use(morgan('dev'));
} else if (isStaging) {
  app.use(morgan('combined'));
} else {
  app.use(morgan('common'));
}

// ======================
// Routes
// ======================

app.get('/health', (req, res) => {
  const healthCheck = {
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };
  
  res.status(200).json(healthCheck);
});

// Environment info endpoint (disable in production)
if (!isProduction) {
  app.get('/debug/env', (req, res) => {
    res.json({
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      platform: process.platform,
      corsConfig: getCorsOptions(),
      database: {
        readyState: mongoose.connection.readyState,
        name: mongoose.connection.name,
        host: mongoose.connection.host
      }
    });
  });
}

// API routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handler
app.use((error, req, res, next) => {
  if (!isProduction || (error.statusCode && error.statusCode >= 500)) {
    console.error('Global error handler:', error);
  }

  if (error.name === 'ValidationError') {
    const errors = {};
    Object.keys(error.errors).forEach(key => {
      errors[key] = error.errors[key].message;
    });
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid resource ID'
    });
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  if (error.message && error.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'Cross-origin request blocked'
    });
  }

  const statusCode = error.statusCode || error.status || 500;
  
  const response = {
    success: false,
    message: error.message || 'Internal server error',
    ...(isProduction ? {} : { 
      stack: error.stack,
      type: error.name 
    })
  };
  
  res.status(statusCode).json(response);
});

// ======================
// Graceful Shutdown
// ======================
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  try {
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
      console.log('Server closed successfully');
    }
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
    
    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// ======================
// Server Startup
// ======================
const PORT = process.env.PORT || 5000;
let server;

const startServer = async () => {
  try {
    await connectDatabase();
    
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
      
      if (!isProduction) {
        console.log(`🔧 Debug info: http://localhost:${PORT}/debug/env`);
      }
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;