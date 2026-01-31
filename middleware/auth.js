const { verifyToken } = require("../utils/jwt");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing Authorization: Bearer <token>" });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Optional: only allow tokens that were minted for your agent
function requireAgent(req, res, next) {
  if (!req.user || req.user.type !== "agent") {
    return res.status(403).json({ error: "Agent token required" });
  }
  next();
}

module.exports = { requireAuth, requireAgent };
