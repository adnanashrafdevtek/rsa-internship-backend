const express = require("express");
const { signAgentToken } = require("../utils/jwt");
const { requireAuth, requireAgent } = require("../middleware/auth");

const router = express.Router();

/**
 * POST /api/agent/token
 * Creates a JWT for your Langflow agent.
 *
 * Protect this route! Here we use a simple header key.
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

  // Put only what you need in a token
  const payload = {
    type: "agent",
    role: "langflow",
    scope: ["calendar:read", "calendar:write"], // adjust permissions
  };

  const token = signAgentToken(payload);
  res.json({ token });
});

/**
 * Example protected endpoint the agent can call
 * POST /api/agent/ping
 */
router.post("/agent/ping", requireAuth, requireAgent, (req, res) => {
  res.json({ ok: true, message: "Agent authenticated", tokenData: req.user });
});

module.exports = router;
