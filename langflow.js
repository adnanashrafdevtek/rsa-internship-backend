const fetch = require("node-fetch");

const LANGFLOW_BASE = process.env.LANGFLOW_BASE || "http://localhost:7860";
const LANGFLOW_RUN_URL = process.env.LANGFLOW_RUN_URL; // like /api/v1/run/<flow_id>
const LANGFLOW_API_KEY = process.env.LANGFLOW_API_KEY;

async function runLangflow(message, sessionId) {
  if (!LANGFLOW_RUN_URL) throw new Error("Missing LANGFLOW_RUN_URL in .env");
  if (!LANGFLOW_API_KEY) throw new Error("Missing LANGFLOW_API_KEY in .env");

  const payload = {
    output_type: "chat",
    input_type: "chat",
    input_value: message,
    session_id: sessionId || "backend-session",
  };

  const res = await fetch(`${LANGFLOW_BASE}${LANGFLOW_RUN_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": LANGFLOW_API_KEY, // this is what Langflow expects
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Langflow error ${res.status}: ${text}`);
  }

  return res.json();
}

module.exports = { runLangflow };
