const { sessions } = require('../lib/store');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  const session = sessions.get(id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  res.json({
    sessionId: id,
    title: session.title,
    subtitle: session.subtitle,
    targetCount: session.targetCount,
    buttons: session.buttons,
    completeTitle: session.completeTitle,
    cards: session.cards,
    votes: session.votes,
    currentIndex: session.currentIndex,
  });
};
