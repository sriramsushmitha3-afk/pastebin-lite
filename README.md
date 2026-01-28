# Pastebin Lite

A small Pastebin-like application where users can create text pastes and share a link to view them.
Supports optional time-based expiry (TTL) and view-count limits.

This project was built as a take-home assignment and is tested via automated API checks.

## Features

* Create a text paste
* Shareable URL to view the paste
* Optional expiration via:

  * Time-to-live (TTL)
  * Maximum view count
* API + HTML view support

## Tech Stack

* Next.js (App Router)
* Node.js
* Vercel (deployment)
* Upstash Redis (via `@vercel/kv`) for persistence

## API Endpoints

### Health Check

```
GET /api/healthz
```

Returns:

```json
{ "ok": true }
```

### Create a Paste

```
POST /api/pastes
Content-Type: application/json
```

Body:

```json
{
  "content": "Hello World",
  "ttl_seconds": 60,
  "max_views": 5
}
```

Response:

```json
{
  "id": "string",
  "url": "https://<domain>/p/<id>"
}
```

### Fetch a Paste (API)

```
GET /api/pastes/:id
```

Each successful fetch counts as a view.

### View a Paste (HTML)

```
GET /p/:id
```

Returns a safe HTML page containing the paste content.

## Running Locally

1. Install dependencies:

```bash
npm install
```

2. Set environment variables (see Vercel / Upstash KV):

* `KV_REST_API_URL`
* `KV_REST_API_TOKEN`
* `KV_REST_API_READ_ONLY_TOKEN`

3. Start the dev server:

```bash
npm run dev
```

The app will run on `http://localhost:3000`.

## Persistence Layer

This application uses **Upstash Redis** via Vercel KV (`@vercel/kv`) to persist pastes.
This ensures data survives across serverless requests and deployments.

## Notes

* In-memory storage is not used.
* Secrets are managed via Vercel environment variables.
* Designed to pass deterministic expiry tests using `TEST_MODE` and `x-test-now-ms`.

## Deployment

Production URL:
https://pastebinlite-flax.vercel.app
