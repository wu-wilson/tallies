## ⚡ Overview

[**Tallies**](https://tallies.dev) splits bills — scan one or more receipts, assign items to people, and share a per-person breakdown via a short link. Multiple receipts combine into one breakdown, each with its own tax and tip.

## 🔭 Architecture

```
┌─────────────────────────────────────────┐
│                 Browser                 │
│                                         │
│       ┌───────────┐  ┌─────────┐        │
│       │ React UI  │←→│ Zustand │        │
│       │(Tailwind) │  │  Store  │        │
│       └─────┬─────┘  └─────────┘        │
│             │                           │
│       ┌─────┴─────┐                     │
│       │  Canvas   │  ← receipt photo    │
│       └─────┬─────┘     compression     │
└─────────────┼───────────────────────────┘
              │ HTTPS
┌─────────────┴───────────┐    ┌──────────┐
│  Express API            │    │   Cron   │
│  /api/ocr  /api/bills   │    │ (weekly) │
└────┬──────────────┬─────┘    └────┬─────┘
     │              │               │
┌────┴─────┐  ┌─────┴───────────────┴─────┐
│ Claude   │  │         Postgres          │
│  API     │  │ (Railway — bills + TTL)   │
│ (Sonnet) │  │                           │
└──────────┘  └───────────────────────────┘
```

## 🚀 Stack

#### Client

- React 18 (TS)
- Tailwind CSS v3
- Zustand
- Framer Motion
- React Router

#### Server

- Express (TS)
- Anthropic SDK (Claude Sonnet)
- pg + Zod

#### Cron

- Node.js script
- pg driver

## 🛠️ Local Setup

#### 1. Clone the repository

```bash
git clone https://github.com/wu-wilson/tallies.git
cd tallies
```

#### 2. Set up Postgres (one-time)

```bash
brew install postgresql@18
brew services start postgresql@18
createdb tallies
psql tallies -f schema.sql
```

#### 3. Launch the app

```bash
./launch.sh
```

The script installs dependencies on first run, then starts the API server on port `3001` and the client on `http://localhost:5173`.

> Requires Node.js 18+ and npm 9+.

The cron service is not started by `launch.sh` — it's a scheduled job that only runs on Railway. To test it locally: `cd cron && npm run dev`.

## ☁️ Deployment

Deployed on [Railway](https://railway.app) as three services: the client ships as a static build (`tallies.dev`), the server runs as a separate API (`api.tallies.dev`), and the cron runs weekly to delete expired bills. DNS via [Cloudflare](https://www.cloudflare.com).

## ⚙️ Configuration

Every variable ships with a working default except `ANTHROPIC_API_KEY`, which is required for receipt scanning (OCR). `./launch.sh` runs on a fresh clone with no env files — override the rest only to change a default.

- **Local dev** — create `client/.env`, `server/.env`, or `cron/.env` (all gitignored).
- **Production (Railway)** — variables are set in each service's **Variables** tab.

#### Client (`client/`)

| Variable       | Default                 | Description                                                               |
| -------------- | ----------------------- | ------------------------------------------------------------------------- |
| `VITE_API_URL` | `http://localhost:3001` | API server URL. Baked in at **build time** — changing requires a rebuild. |

#### Server (`server/`)

| Variable                    | Default                               | Description                                                                                     |
| --------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `PORT`                      | `3001`                                | API listen port. Auto-injected by Railway in production.                                        |
| `ANTHROPIC_API_KEY`         | —                                     | Required. OCR returns 500 if missing.                                                           |
| `DATABASE_URL`              | `postgresql://localhost:5432/tallies` | Postgres connection. Share endpoints return 503 if unreachable.                                 |
| `WRITE_RATE_LIMIT_PER_HOUR` | `30`                                  | Write requests/hr/IP, shared across both write endpoints (POST `/api/ocr` + POST `/api/bills`). |
| `READ_RATE_LIMIT_PER_HOUR`  | `200`                                 | Read requests/hr/IP for GET `/api/bills/:id`.                                                   |
| `MAX_IMAGE_SIZE_BYTES`      | `5242880`                             | Max receipt image size (5 MB).                                                                  |
| `ALLOWED_ORIGINS`           | `*`                                   | Comma-separated CORS allowlist. Set to `https://tallies.dev` in production.                     |

#### Cron (`cron/`)

| Variable       | Default                               | Description                                               |
| -------------- | ------------------------------------- | --------------------------------------------------------- |
| `DATABASE_URL` | `postgresql://localhost:5432/tallies` | Postgres connection. Cleanup fails loudly if unreachable. |

Schedule is defined in `cron/railway.json` via `cronSchedule` (currently `0 9 * * 0` — Sundays at 09:00 UTC).
