const { sessions } = require('../../lib/store');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  const session = await sessions.get(id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const { cardId, vote } = req.body || {};
  if (!cardId || !vote) return res.status(400).json({ error: 'cardId and vote required' });

  session.votes[cardId] = vote;
  session.currentIndex = Object.keys(session.votes).length;

  // Trigger callback when 5 or fewer unvoted cards remain
  const unvotedCards = session.cards.filter(c => !(c.id in session.votes));
  if (unvotedCards.length <= 5 && !session.callbackSent && session.callbackUrl) {
    session.callbackSent = true;

    const positiveBtn = (session.buttons || []).find(b => b.style === 'positive');
    const positiveValue = positiveBtn ? positiveBtn.value : 'nice';
    const niceCount = Object.values(session.votes).filter(v => v === positiveValue).length;

    fetch(session.callbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: id,
        event: 'need_more_cards',
        votedSoFar: session.votes,
        totalShown: session.cards.length,
        totalNice: niceCount,
        totalNo: Object.keys(session.votes).length - niceCount,
      }),
    }).catch(err => console.error('Callback failed:', err.message));
  }

  await sessions.set(id, session);
  res.json({ ok: true, currentIndex: session.currentIndex, remaining: unvotedCards.length - 1 });
};
