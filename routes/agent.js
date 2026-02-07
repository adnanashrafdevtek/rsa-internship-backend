const express = require("express");
const { signAgentToken, signAdminToken, signTeacherToken, signStudentToken } = require("../utils/jwt");
const { requireAuth, requireAgent, requireAdmin, requireTeacher, requireStudent } = require("../middleware/auth");

const router = express.Router();

/**
 * POST /api/agent/token
 * Creates a JWT for Langflow agent
 * Header: x-agent-mint-key: <AGENT_MINT_KEY>
 */
router.post("/agent/token", (req, res) => {
  const mintKey = req.headers["x-agent-mint-key"];
  if (!process.env.AGENT_MINT_KEY) {
    return res.status(500).json({ error: "AGENT_MINT_KEY missing in .env" });
  }
  if (!mintKey || mintKey !== process.env.AGENT_MINT_KEY) {
    return res.status(401).json({ error: "Unauthorized (bad mint key)" });
  }

  const payload = {
    type: "agent",
    role: "langflow",
    scope: ["calendar:read", "calendar:write"],
  };

  const token = signAgentToken(payload);
  res.json({ token });
});

/**
 * POST /api/agent/ping - Verify agent token works
 */
router.post("/agent/ping", requireAuth, requireAgent, (req, res) => {
  res.json({ ok: true, message: "Agent authenticated", tokenData: req.user });
});

/**
 * POST /api/auth/admin - Get admin token (for testing)
 */
router.post("/auth/admin", (req, res) => {
  const token = signAdminToken("admin-user-1");
  res.json({ token, role: "admin" });
});

/**
 * POST /api/auth/teacher - Get teacher token (for testing)
 */
router.post("/auth/teacher", (req, res) => {
  const token = signTeacherToken("teacher-user-1");
  res.json({ token, role: "teacher" });
});

/**
 * POST /api/auth/student - Get student token (for testing)
 */
router.post("/auth/student", (req, res) => {
  const token = signStudentToken("student-user-1");
  res.json({ token, role: "student" });
});

/**
 * Admin endpoints
 */
router.post("/admin/create-class", requireAuth, requireAdmin, (req, res) => {
  res.json({ ok: true, message: "Class created", user: req.user });
});

router.post("/admin/create-user", requireAuth, requireAdmin, (req, res) => {
  res.json({ ok: true, message: "User created", user: req.user });
});

router.post("/admin/create-schedule", requireAuth, requireAdmin, (req, res) => {
  res.json({ ok: true, message: "Schedule created", user: req.user });
});

/**
 * Teacher endpoints
 */
router.get("/teacher/schedule", requireAuth, requireTeacher, (req, res) => {
  res.json({ ok: true, message: "Your schedule", user: req.user, schedule: [] });
});

router.put("/teacher/schedule/:id", requireAuth, requireTeacher, (req, res) => {
  res.json({ ok: true, message: "Schedule updated", user: req.user });
});

/**
 * Student endpoints
 */
router.get("/student/schedule", requireAuth, requireStudent, (req, res) => {
  res.json({ ok: true, message: "Schedule view", user: req.user, schedule: [] });
});

module.exports = router;
