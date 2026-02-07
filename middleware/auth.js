const { verifyToken } = require("../utils/jwt");

/**
 * Middleware to verify JWT token from Authorization header
 * Expected format: Bearer <token>
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Invalid Authorization header format. Use 'Bearer <token>'" });
  }

  const token = parts[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token", details: err.message });
  }
}

/**
 * Middleware to check if the authenticated user is an agent
 */
function requireAgent(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  if (req.user.type !== "agent") {
    return res.status(403).json({ error: "Forbidden: Agent role required" });
  }

  next();
}

/**
 * Middleware to check if user is admin
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin role required" });
  }

  next();
}

/**
 * Middleware to check if user is teacher
 */
function requireTeacher(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  if (req.user.role !== "teacher" && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Teacher role required" });
  }

  next();
}

/**
 * Middleware to check if user is student
 */
function requireStudent(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  if (req.user.role !== "student" && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Student role required" });
  }

  next();
}

module.exports = { requireAuth, requireAgent, requireAdmin, requireTeacher, requireStudent };
