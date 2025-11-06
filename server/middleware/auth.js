/**
 * Authentication Middleware
 * 
 * Currently uses mock authentication.
 * Replace with real JWT/OAuth authentication in production.
 */

import { UserStore } from '../config/database.js';

/**
 * Mock authentication middleware
 * In production, verify JWT token or session
 */
export const authenticate = (req, res, next) => {
  // For now, extract user from header or default to first user
  // In production, verify JWT token from Authorization header
  const userId = req.headers['x-user-id'] || '1';
  const userEmail = req.headers['x-user-email'] || 'sarah.johnson@example.com';
  
  const user = UserStore.findByEmail(userEmail) || UserStore.findById(userId);
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = user;
  next();
};

/**
 * Optional authentication - doesn't fail if no user
 */
export const optionalAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userEmail = req.headers['x-user-email'];
  
  if (userId || userEmail) {
    const user = UserStore.findByEmail(userEmail) || UserStore.findById(userId);
    req.user = user || null;
  } else {
    req.user = null;
  }
  
  next();
};

/**
 * Check if user has required role
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

