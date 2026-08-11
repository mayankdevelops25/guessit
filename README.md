# Guess of the Day 🎯

A daily browser deduction puzzle. One hidden answer is chosen each day. Tap **yes/no question chips** to narrow the pool of candidates, then guess in the fewest taps.

> **Live site:** guessofday.game  
> **Stack:** React 19 + Vite · Cloudflare Pages Functions · Cloudflare KV · Firebase Analytics

---

## How the game works

1. A category (e.g. Animals, Countries, Elements) is selected deterministically per date
2. One answer from that category is chosen as the hidden daily answer
3. Players tap plain-language yes/no chips — each chip is answered instantly and the pool shrinks live
4. When ≤ 5 candidates remain, the guess panel unlocks
5. Players have **limited lives** based on pool size at first guess (4–5 candidates → 2 lives, 2–3 → 1 life)
6. Streak is tracked server-side; practice mode never affects streak

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Backend | Cloudflare Pages Functions (Edge, `/functions/api/*`) |
| Session storage | Cloudflare KV (`SESSION_KV` binding) |
| Analytics | Firebase Analytics (client-side, consent-gated) |
| Hosting | Cloudflare Pages |
| Build output | Single-file HTML (`vite-plugin-singlefile`) |

---

## Local Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/mayankdevelops25/guessit.git
cd guessit

# 2. Install dependencies
npm install

# 3. Copy env file (analytics only — backend works without it)
cp .env.example .env

# 4. Start dev server (includes mock backend — no Cloudflare account needed)
npm run dev
```

The dev server runs at **http://localhost:5173** with a full in-memory mock of all `/api/*` endpoints via `vite.config.ts`.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with mock backend |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Preview production build locally |
| `npx tsc --noEmit` | TypeScript type check only |

---

## Project Structure

```
├── src/
│   ├── App.tsx              # Entire game UI + state (single component)
│   ├── lib/
│   │   ├── consent.ts       # GDPR consent management (localStorage)
│   │   ├── audio.ts         # Sound effects
│   │   └── session.ts       # Client-side session ID management
│   └── pages/
│       └── Docs.tsx         # Legal pages (Privacy, Terms, Sitemap, etc.)
│
├── functions/
│   ├── _lib/
│   │   └── sessionStore.ts  # Cloudflare KV abstraction (prod) / in-memory Map (dev)
│   └── api/
│       ├── session.ts       # POST /api/session  — mint anonymous session
│       ├── chip.ts          # POST /api/chip     — answer a yes/no chip
│       ├── guess.ts         # POST /api/guess    — validate guess, update streak
│       ├── state.ts         # GET/POST /api/state — save/restore game progress
│       ├── share.ts         # GET /api/share     — signed share token
│       ├── daily.ts         # GET /api/daily     — category metadata (no answer leak)
│       ├── analytics.ts     # POST /api/analytics — event buffering
│       └── health.ts        # GET /api/health    — uptime check
│
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── _redirects           # Cloudflare Pages SPA fallback (/* → /index.html)
│   ├── favicon.png
│   ├── og-card.png          # 1200×630 Open Graph image
│   └── icons/               # PWA icons (192, 512, 512-maskable, apple-touch-icon)
│
├── wrangler.toml            # Cloudflare Pages deployment config
├── .env.example             # Environment variable template
└── vite.config.ts           # Vite config + full mock API server for dev
```

---

## Environment Variables

Copy `.env.example` to `.env`. Analytics won't work without real values, but the game itself (chips, guesses, streaks in dev) works fully without them.

```bash
# Firebase Web Config — get from Firebase Console > Project Settings > Your Apps
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

> These `VITE_` vars are embedded in the client bundle at build time. They are safe to expose publicly.

---

## Deployment (Cloudflare Pages)

### 1. Create KV namespaces

```bash
npx wrangler kv:namespace create SESSION_KV
npx wrangler kv:namespace create SESSION_KV --preview
```

Copy the `id` and `preview_id` from the output and fill in `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "SESSION_KV"
id = "YOUR_PRODUCTION_KV_ID"
preview_id = "YOUR_PREVIEW_KV_ID"
```

> Without this, sessions fall back to an in-memory Map that resets on every worker cold-start — streaks will randomly disappear.

### 2. Set the share signing secret

Remove `SHARE_SECRET` from `[vars]` in `wrangler.toml`, then set it as a Cloudflare secret:

```bash
npx wrangler secret put SHARE_SECRET
# Paste a strong random string when prompted
# Generate one with: openssl rand -hex 32
```

### 3. Add Firebase env vars to Cloudflare Pages

Go to **Cloudflare Dashboard → Pages → your project → Settings → Environment Variables** and add all `VITE_FIREBASE_*` vars. These are baked into the static bundle at build time by Vite, so Cloudflare Pages needs them during the build step.

### 4. Configure rate limiting

In **Cloudflare Dashboard → Security → Rate Limiting Rules**, create:

| Rule | Path contains | Limit |
|---|---|---|
| Chip rate limit | `/api/chip` | 80 req / 60s per IP |
| Guess rate limit | `/api/guess` | 30 req / 60s per IP |

### 5. Deploy

Push to `main` — Cloudflare Pages auto-deploys on every push.

**Cloudflare Pages build settings:**

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | `18` |

---

## Architecture Notes

- **Sessions are anonymous.** Each browser gets a UUID stored in `localStorage`. No login required.
- **Streak is server-validated.** The client sends guesses to `/api/guess`; the server updates streak in KV. Editing `localStorage` cannot inflate it.
- **The answer is never leaked.** `/api/daily` returns chips and metadata but not the answer. The answer is only verified server-side in `/api/chip` and `/api/guess`.
- **Dev mock is complete.** `vite.config.ts` contains a full in-memory replica of all API endpoints with proper session/streak logic. No Cloudflare account needed to develop locally.
- **Single-file build.** `vite-plugin-singlefile` inlines all JS/CSS into `dist/index.html`. The entire app is one file.

---

## Pre-Launch Checklist

- [ ] `SESSION_KV` IDs filled in and block uncommented in `wrangler.toml`
- [ ] `SHARE_SECRET` set via `wrangler secret put` (not in `[vars]`)
- [ ] `VITE_FIREBASE_*` vars added to Cloudflare Pages environment variables
- [ ] Rate limiting rules created in Cloudflare dashboard
- [ ] Custom domain configured in Cloudflare Pages

---

## License

MIT
