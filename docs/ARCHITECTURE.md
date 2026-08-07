# Guess of the Day — Architecture (Option A)

> **Decision:** Option A (Cloudflare Pages + Functions + KV + anonymous sessions) is the ship target.  
> Option B (Firebase-only Functions/Auth) is discarded — it adds vendor lock-in and cold-start latency without benefit at v1 scale. All Firebase usage below is **Analytics only**.

## 1 — Why a backend at all? (PRD §15)

Fully static would ship the secret answer in the JS bundle → readable in dev tools (Wordle leak, Jan 2022). FR-10 demands the answer stay hidden until solved. Minimal edge layer:

- `GET /api/daily?date=YYYY-MM-DD` — same for every player, edge-cached (`s-maxage=86400`), never includes hidden id.
- `POST /api/chip { date, chipId }` — server checks hidden, returns yes/no.
- `POST /api/guess { date, guessId }` — server validates, returns `correct` (+ answer only on correct) and **server-validated streak**.
- `POST /api/analytics { name, params }` — FR-9 ingest.

No AI, no DB in hot path at v1: answers are deterministic `hash(date) % pool` from `src/lib/content.ts`. Function is ~5ms.

## 2 — Inspired by Wordle / NYT Games (research July 2026)

| Wordle flaw | How we fix it |
|---|---|
| **Streak in `localStorage` (`nyt-wordle-statistics`) editable** — Reddit guides show `localStorage.setItem('nyt-wordle-statistics', ...)` restores streak; later `games-state-wordleV2/xxxx` + timestamp hack still spoofs. | **Server-validated streak**: anonymous session in KV, server computes `streak.count/lastDate` and is source of truth. Client keeps localStorage only as offline cache; on `POST /api/session` server streak wins if newer (timestamp sync like NYT's post-2022 account sync). |
| **Game state in `localStorage` lost on device switch** | **Puzzle state persistence per session** via `GET/POST /api/state?date=...` — stores `asked[]`, `taps`, `guessAttempts`, `completed`. Reload resumes, like Wordle's `games-state-wordleV2`. |
| **Share grid spoofable** (emoji grid + score edited in screenshot) | **Signed share token** `GET /api/share?date=...` returns `shareText + token`. Token is `hash(sid:date:taps:SHARE_SECRET)`. Verifiable without leaking answer. |
| **No anonymous → account upgrade** | `POST /api/session` mints an anonymous `gotd_sid` (UUID v4) stored in `localStorage` + `Set-Cookie: gotd_sid`. Future Firebase Auth `signInAnonymously()` can link this id (v2). |
| **Rate limit by IP only** — shared IPs/CGNAT | Rate limit by `sessionId + date` first, fallback to IP (80 req/min chip, 30 guess). |
| **Archive replay abuse** | `GET /api/daily` is same for all, but `/api/state`/`/api/guess` enforce `completed` idempotency — can't replay same daily to inflate streak. Practice mode bypasses streak. |

## 3 — Layers (PRD §5)

| Layer | Files | Runtime |
|---|---|---|
| Content | `src/lib/content.ts` | isomorphic |
| Logic (ranking) | `src/lib/content.ts#rankChips` — 50/50 info-gain, pure | client |
| Experience | `src/App.tsx` — single-screen, no typing | client |
| Growth + Session | `src/lib/api.ts`, `src/lib/session.ts`, `functions/api/*`, `functions/_lib/sessionStore.ts`, `src/lib/firebase.ts` | edge + client |

## 4 — Session management (anonymous, no login — Wordle pattern)

**Client** `src/lib/session.ts`:
- `ensureLocalSessionId()` — UUID in `localStorage: gotd-session-id`. Always sent as `X-Session-Id`.
- On mount, `ensureSession()` POSTs to `/api/session` — server mints `Session{ id, streak, history, states }` in KV (or memory in `vite dev` mock).
- Future: upgrade to permanent login by POSTing Firebase ID token to same session id.

**Server** `functions/_lib/sessionStore.ts` + `functions/api/session.ts`:
- `SESSION_KV` binding (Cloudflare KV, 90d TTL). Dev fallback is `Map`.
- `SessionStreak { count, lastDate, freezeAvailable }` — freeze forgives first 2-day gap (PRD gentle forgiveness), then resets.
- Every `chip/guess/state` request updates `lastSeen` and validates against stored `states[date]`.

**Streak algorithm** (server, in `guess.ts`):
```
if (!last) streak=1
else if (last===date) no-op (idempotent)
else if (isConsecutive(last,date)) streak++
else if (gap===2 && freezeAvailable) streak++ + consume freeze
else streak=1 (reset, freeze refilled)
```
Client syncs this on solve — localStorage is overwritten only if server count > local (Wordle timestamp sync).

## 5 — Puzzle state

`POST /api/state` validates `asked.length === taps` (anti-cheat) and `asked[i].id` uniqueness. `GET /api/state?date=...` restores after reload. `chip.ts` and `guess.ts` also opportunistically update state so a flaky `/state` POST can't desync.

## 6 — Frontend

- Vite singlefile static (<2s mobile), `localStorage` offline cache retained for offline play but never trusted for streak when online.
- `src/lib/api.ts` attaches `X-Session-Id` to every request — same contract for Vite mock and prod Functions.
- `src/App.tsx` calls `restoreFromServer(date)` on `startDaily`/`startArchiveDate` — if server has `completed:true`, shows `won/lost` immediately (Wordle "already played today" behavior).

## 7 — Firebase Analytics (FR-9)

- `src/lib/firebase.ts` — `initFirebaseAnalytics()` with `isSupported()` guard, `VITE_FIREBASE_*` env.
- `src/lib/analytics.ts` — `logEvent()` dual-sinks: Firebase Analytics **and** `navigator.sendBeacon('/api/analytics')` → Pages Function → KV/Analytics Engine.
- `firebase.json` + `firestore.rules` lock direct writes; analytics via function only.
- Degrades gracefully if keys missing — game never blocks.

## 8 — Security & abuse (PRD §15)

- Answer never in bundle/network until `guess` correct.
- Rate limit per session (Cloudflare Rate Limiting rule + in-memory map).
- KV sessions have 90d TTL, auto-GC.
- Turnstile (`VITE_TURNSTILE_SITE_KEY`) is a fast-follow, not wired at launch.

## 9 — Deploy (Option A)

- **Cloudflare Pages**: connect repo → `npm run build` → `dist` → Functions auto-detected. Set `SESSION_KV` binding and `SHARE_SECRET`.
- **Local**: `npm run dev` (Vite mock) or `npx wrangler pages dev dist` (real KV).
- **Firebase Hosting** discarded.

## 8b — Legal docs & privacy (NYT/Wordle pattern)

- Footer links (like NYT Games): **Sitemap · Privacy Policy · Terms of Service · Cookie Policy · Terms of Sale · Manage Privacy Preferences** — all rendered in-app at shareable hash routes (`#/docs/privacy`, etc.) in `src/pages/Docs.tsx`, so the single-file build needs no extra routes.
- **Consent layer** (`src/lib/consent.ts`): `gotd-consent` in localStorage. Essential storage always on; analytics toggle gated end-to-end — `src/lib/firebase.ts` refuses to init Firebase and refuses to fire events (including the `/api/analytics` beacon) when the player opts out. First-time visitors get a slim bottom cookie banner with Accept / Manage; "Reset" revokes consent.
- Docs drafted: privacy (session id, progress, analytics, third-party CDN images, retention 90d), terms (free service, IP, no guarantees), cookies (localStorage vs cookies, no ad trackers), terms of sale (nothing for sale at v1; refund policy reserved for future premium), sitemap.

## 9b — Categories (proof that scaling is additive)

`src/lib/content.ts` now exports a `CATEGORIES` registry:

| id | answers | chips | sample |
|---|---|---|---|
| `animals` | 50 | 12 | "Is it bigger than a cat?" |
| `countries` | 50 | 12 | "Is it an island nation?" |
| `companies` | 50 | 12 | "Does it make cars?" |
| `figures` | 50 | 12 | "Were they a scientist?" |

**Tile visuals (`<Glyph>`).** One component, four modes, all graceful:
- **Countries** carry `iso` → real flag via `https://flagcdn.com/w80/{iso}.png` (flag emoji doesn't render on Windows).
- **Companies** carry a `domain` (via `BRAND_DOMAIN` map) → **real brand logo** from DuckDuckGo's icon service (`icons.duckduckgo.com/ip3/{domain}.ico`), falling back to Google's favicon CDN (`/s2/favicons?sz=128`), then emoji. No API key needed.
- **Historical figures** carry `wiki` (Wikipedia page title) → **real portrait photo** via Wikipedia REST API (`/api/rest_v1/page/summary/{wiki}`). Uses a React component `<WikiGlyph>` to lazily fetch and cache the thumbnail URL in `sessionStorage`, falling back to a clean monogram avatar (`figureInitials`) instantly.
- **Animals** render their emoji.
Every external `<img>` has an `onError` chain so a blocked CDN/API never breaks a tile.

**Pool sizing.** 50 answers needs ~log2(50) ≈ 5.6 clean splits, so each category now ships 12 chips (added *bigger than a human / fits in your hands* for animals, *in Asia / in Africa* for countries) to guarantee the ≤5 "Make a Guess" threshold is always reachable.

- `Answer.tags` is `Record<string, any>` — each category defines its own dimensions (`continent/island/landlocked/population/hemisphere/monarchy/hostedOlympics/coldClimate/spanishSpeaking`) with an authored `chip_text` per tag. **No schema change was needed** to add Countries (PRD §12/§14) — only new rows.
- `getDailyCategory(date) = hash('cat-'+date) % CATEGORIES.length` — one category per day, system-chosen, no select screen (PRD §11). `getDailyAnswer` picks from that day's pool.
- Chips are **category-scoped server-side**: `/api/chip` and `/api/guess` reject ids that don't belong to the day's category (`unknown chip for this category`), so a client can't probe the Animals pool on a Countries day.
- `/api/daily` returns `category` + `categoryLabel`; `/api/share` labels the card with the day's category.
- Ranking is unchanged — `rankChips(candidates, asked, chips)` takes the category's chips and still scores by closeness to a 50/50 split.
- Archive no longer renders the answer emoji for unplayed dates (showed a spoiler) — it shows a category glyph (🐾 / 🌍) until solved.

## 10 — Scaling (PRD §14)

- Add answers → rows in `content.ts`, no schema change.
- New category → new pool, same ranking.
- Premium gating → filter by `daily_rotation_eligibility` + check `/api/state` history length.
- AI authoring → upstream of `content.ts`, never in runtime.
