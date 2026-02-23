# Layman

A layman UI to handle recommendations from bots. Swipe-based card interface for Telegram Mini Apps.

## Architecture

```
Bot (recommendation engine) ←→ Layman API (session store) ←→ Frontend (swipe UI)
```

- **Bot** generates recommendations and creates sessions via API
- **Layman** stores session state and relays between bot and user
- **Frontend** renders cards, handles swipe gestures, submits votes

## API

### `POST /api/session` — Create session (bot → layman)
```json
{
  "botSecret": "your-secret",
  "userId": "user123",
  "title": "Weekly Meal Plan",
  "subtitle": "Swipe right on meals you'd like",
  "targetCount": 7,
  "cards": [
    { "id": "pasta", "title": "Pasta", "description": "Classic Italian", "image": "https://...", "tags": ["🇮🇹"] }
  ],
  "buttons": [
    { "label": "👍 Nice", "value": "nice", "style": "positive" },
    { "label": "👎 No", "value": "no", "style": "negative" }
  ],
  "callbackUrl": "https://your-bot/webhook/swipe"
}
```
Returns: `{ sessionId, url }`

### `GET /api/session/:id` — Get session (frontend)
### `POST /api/session/:id/vote` — Submit vote (frontend)
### `POST /api/session/:id/extend` — Add more cards (bot → layman)

## Lazy Loading

When only 5 unvoted cards remain, the API calls `callbackUrl` with:
```json
{ "event": "need_more_cards", "votedSoFar": {...}, "totalNice": 4, "totalNo": 6 }
```
The bot then calls `/extend` with new cards. Frontend polls and picks them up seamlessly.

## Deploy

```bash
# Set BOT_SECRET in Vercel environment variables
vercel --prod
```

## License

MIT
