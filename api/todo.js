const { sessions } = require('./lib/store');
const { randomUUID } = require('crypto');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, title, subtitle, items, callbackUrl, reactions } = req.body || {};
  if (!items?.length) return res.status(400).json({ error: 'items required' });

  const sessionId = randomUUID().slice(0, 12);
  await sessions.set(sessionId, {
    type: 'todo',
    userId,
    title: title || 'To Do',
    subtitle: subtitle || '',
    // Available reaction emojis (user can optionally tag items with these)
    reactions: reactions || ['😊', '😤', '🎉', '😴', '🔥'],
    items: items.map((item, i) => ({
      id: item.id || `todo-${i}`,
      title: item.title,
      description: item.description || '',
      emoji: item.emoji || '📌',
      done: false,
      reaction: null,   // emoji reaction from user
      doneAt: null,
    })),
    callbackUrl,
    createdAt: Date.now(),
  });

  const baseUrl = process.env.APP_URL || `https://${req.headers.host}`;
  res.json({ sessionId, url: `${baseUrl}/todo.html?s=${sessionId}` });
};
