const { sessions } = require('../../lib/store');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  const session = await sessions.get(id);
  if (!session || session.type !== 'todo') {
    return res.status(404).json({ error: 'Todo session not found' });
  }

  const { itemId, done, reaction } = req.body || {};
  if (!itemId) return res.status(400).json({ error: 'itemId required' });

  const item = session.items.find(i => i.id === itemId);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  // Update done status
  if (typeof done === 'boolean') {
    item.done = done;
    item.doneAt = done ? Date.now() : null;
  }

  // Update reaction (emoji or null to clear)
  if (reaction !== undefined) {
    item.reaction = reaction;
  }

  await sessions.set(id, session);

  // Callback when all items are done
  const allDone = session.items.every(i => i.done);
  if (allDone && session.callbackUrl) {
    fetch(session.callbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: id,
        event: 'todo_complete',
        items: session.items,
      }),
    }).catch(err => console.error('Callback failed:', err.message));
  }

  const doneCount = session.items.filter(i => i.done).length;
  res.json({
    ok: true,
    done: doneCount,
    total: session.items.length,
    allDone,
  });
};
