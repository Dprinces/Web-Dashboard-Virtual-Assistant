const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Add user to request object
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(500).json({ 
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware to check if user is admin (for future use)
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Admin access required',
        code: 'ADMIN_REQUIRED'
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ 
      error: 'Authorization failed',
      code: 'AUTH_ERROR'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      req.userId = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id;
    } else {
      req.user = null;
      req.userId = null;
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    req.user = null;
    req.userId = null;
    next();
  }
};

// Generate JWT token
const generateToken = (userId, expiresIn = '7d') => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn }
  );
};

// Generate refresh token (longer expiry)
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw error;
  }
};

// Rate limiting for sensitive operations
const createRateLimiter = (windowMs, max, message) => {
  const attempts = new Map();
  
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old attempts
    if (attempts.has(key)) {
      const userAttempts = attempts.get(key).filter(time => time > windowStart);
      attempts.set(key, userAttempts);
    }
    
    const currentAttempts = attempts.get(key) || [];
    
    if (currentAttempts.length >= max) {
      return res.status(429).json({
        error: message || 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    currentAttempts.push(now);
    attempts.set(key, currentAttempts);
    
    next();
  };
};

// Rate limiter for login attempts (5 attempts per 15 minutes)
const loginRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many login attempts, please try again later'
);

// Rate limiter for registration (3 attempts per hour)
const registerRateLimit = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3, // 3 attempts
  'Too many registration attempts, please try again later'
);

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  loginRateLimit,
  registerRateLimit
};