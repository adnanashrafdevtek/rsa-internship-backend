const { verifyToken } = require('../utils/jwt');

/**
 * Authentication middleware - verifies JWT token from Authorization header
 * Expected format: Authorization: Bearer <token>
 */
function authMiddleware(req, res, next) {
  // Skip auth for public routes
  const publicRoutes = ['/login', '/api/activate'];
  if (publicRoutes.includes(req.path)) {
    return next();
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false, 
      error: 'Missing Authorization header',
      message: 'Please provide a JWT token in the Authorization header'
    });
  }

  // Extract token from "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid Authorization header format',
      message: 'Use format: Authorization: Bearer <token>'
    });
  }

  const token = parts[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired token',
      message: 'Token is invalid or has expired. Please login again.'
    });
  }

  // Attach user info to request
  req.user = decoded;
  next();
}

/**
 * Middleware to check if user has a specific role
 */
function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions',
        message: `This endpoint requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

module.exports = {
  authMiddleware,
  roleMiddleware,
};
