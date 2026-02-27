const { sessions } = require('../lib/store');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  const session = await sessions.get(id);
  if (!session || session.type !== 'todo') {
    return res.status(404).json({ error: 'Todo session not found' });
  }

  res.json({
    sessionId: id,
    title: session.title,
    subtitle: session.subtitle,
    reactions: session.reactions,
    items: session.items,
  });
};
