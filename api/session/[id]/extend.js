const { sessions } = require('../../lib/store');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  const session = sessions.get(id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const { cards } = req.body || {};
  if (!cards?.length) return res.status(400).json({ error: 'cards required' });

  session.cards.push(...cards);
  session.callbackSent = false; // re-arm for next batch

  res.json({ ok: true, totalCards: session.cards.length });
};
