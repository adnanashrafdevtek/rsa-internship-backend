const jwt = require("jsonwebtoken");

function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET missing in .env");

  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
}

function signAgentToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET missing in .env");

  return jwt.sign({ ...payload, type: "agent" }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
}

function signAdminToken(userId) {
  return signToken({
    userId,
    type: "user",
    role: "admin",
    permissions: ["create:classes", "create:users", "create:schedules", "read:all"],
  });
}

function signTeacherToken(userId) {
  return signToken({
    userId,
    type: "user",
    role: "teacher",
    permissions: ["view:own_schedule", "edit:own_schedule"],
  });
}

function signStudentToken(userId) {
  return signToken({
    userId,
    type: "user",
    role: "student",
    permissions: ["view:schedule"],
  });
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET missing in .env");

  return jwt.verify(token, secret);
}

module.exports = { signToken, signAgentToken, signAdminToken, signTeacherToken, signStudentToken, verifyToken };
