// In-memory session store (MVP)
// TODO: Replace with Vercel KV for persistence across cold starts

const sessions = new Map();
const BOT_SECRET = process.env.BOT_SECRET || 'layman-default-secret';

// Cleanup expired sessions (>24h)
setInterval(() => {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.createdAt > 24 * 60 * 60 * 1000) sessions.delete(id);
  }
}, 60 * 60 * 1000);

module.exports = { sessions, BOT_SECRET };
