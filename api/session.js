const { sessions } = require('./lib/store');
const { randomUUID } = require('crypto');

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, cards, callbackUrl, title, subtitle, targetCount, buttons, completeTitle } = req.body || {};
  if (!cards?.length) return res.status(400).json({ error: 'cards required' });

  const sessionId = randomUUID().slice(0, 12);
  sessions.set(sessionId, {
    userId,
    title: title || 'Recommendations',
    subtitle: subtitle || '',
    targetCount: targetCount || null,
    buttons: buttons || [
      { label: '👍 Nice', value: 'nice', style: 'positive' },
      { label: '👎 No', value: 'no', style: 'negative' },
    ],
    completeTitle: completeTitle || 'All Done! 🎉',
    cards: [...cards],
    votes: {},
    currentIndex: 0,
    callbackUrl,
    callbackSent: false,
    createdAt: Date.now(),
  });

  const baseUrl = process.env.APP_URL
    || `https://${req.headers.host}`;

  res.json({
    sessionId,
    url: `${baseUrl}/?s=${sessionId}`,
  });
};
