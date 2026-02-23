const { createClient } = require('redis');

const REDIS_URL = process.env.REDIS_URL;
const SESSION_TTL = 600; // 10 minutes after last access

let client = null;

async function getClient() {
  if (!client) {
    client = createClient({ url: REDIS_URL });
    client.on('error', err => console.error('Redis error:', err));
    await client.connect();
  }
  return client;
}

const sessions = {
  async get(id) {
    const c = await getClient();
    const data = await c.get(`session:${id}`);
    if (!data) return undefined;
    // Refresh TTL on access
    await c.expire(`session:${id}`, SESSION_TTL);
    return JSON.parse(data);
  },

  async set(id, value) {
    const c = await getClient();
    await c.set(`session:${id}`, JSON.stringify(value), { EX: SESSION_TTL });
  },

  async update(id, fn) {
    const data = await this.get(id);
    if (!data) return undefined;
    const updated = fn(data);
    await this.set(id, updated);
    return updated;
  }
};

module.exports = { sessions };
