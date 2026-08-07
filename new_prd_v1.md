# Product Requirements Document
## "Guess of the Day" — Daily Category-Based Guessing Game (v1)

**Status:** Draft v1
**Owner:** [TBD]
**Last updated:** July 28, 2026

---

## 1. Summary

A daily browser puzzle game combining Wordle's habit loop (one puzzle a day, shareable result) with a lightweight deduction mechanic: the game holds a hidden daily answer, and the player taps plain-language yes/no **question chips** to narrow it down. Every chip is guaranteed to resolve cleanly against every possible answer — no typing, no ambiguity, no wrong path.

Two design principles govern every decision in this doc:

1. **Simplicity first, on both sides.** The player should understand the whole game in one glance. The system should be buildable and maintainable by a small team without an AI dependency in the runtime path.
2. **Built to scale and monetize later, without a rewrite.** Nothing here needs AI at launch, but the data model and architecture should not block adding AI-assisted content authoring, more categories, or premium features down the line.

## 2. Goals

- A first-time player understands the full mechanic within seconds — no onboarding screen needed.
- Zero typing anywhere in the core loop.
- Every question always resolves to a clean yes/no — no "I don't know" states, no dead ends.
- A shareable result card that performs as a free acquisition channel, with daily results comparable across players.
- A **deterministic, dependency-free** content and ranking system that a small team can operate and extend by hand.
- A data model and architecture that can support 10x-100x more content and future monetization features without redesign.
- A mostly-static, SEO-friendly site that deploys and scales with minimal operational overhead.

## 3. Non-Goals (v1)

- No AI/LLM calls anywhere in the runtime game loop.
- No multiplayer or head-to-head modes.
- No native mobile app — browser/PWA only.
- No free-text input anywhere in the core loop.
- No user-generated content or community-submitted answers at launch.
- No localization beyond the launch language.
- No category-select screen at launch — one daily category, chosen by the system (see Section 11 for rationale).
- No user accounts or login at launch (see Section 15 for session handling instead).

## 4. Target User & Use Case

Casual daily-puzzle players (the Wordle/Connections/NYT Games audience) who want a 1-3 minute daily ritual completable on a phone with a thumb, and a result worth sharing to a group chat. Primary session is solo; virality comes from the share card, not from in-app social features.

## 5. Game Structure (Four Layers)

| Layer | Responsibility | Built with |
|---|---|---|
| **Content** | Pool of answers per category, each tagged with structured metadata (size, region, use, living/non-living, etc.), plus a plain-language yes/no **chip phrasing** authored per tag | Manually authored data, stored in DB |
| **Logic** | A ranking engine that decides which 4-6 chips to surface each turn, ranked by how much they'd narrow the remaining pool (info-gain) | Plain deterministic code — a counting/scoring query, not AI |
| **Experience** | A single-screen puzzle UI — pool visualization, chip row, guess flow, reveal | Standard frontend stack |
| **Growth** | Share cards, daily challenge, archive, category rotation | Standard frontend + backend |

Framing: the ranking layer isn't asking questions on the player's behalf — it's deciding *which* pre-written questions are worth offering, using simple math over the tag data. The player always makes the actual choice, and nothing in this stack requires a model call.

## 6. Core Game Loop

1. The daily category is shown — one category per day, no selection screen.
2. The system has a fixed hidden answer for the day (fixed in advance so every player's result is comparable).
3. The player sees 4-6 question chips, each a plain-language yes/no question generated from the remaining answer pool's tag dimensions (e.g., "Is it bigger than a cat?", "Is it found in water?").
4. The player taps a chip.
5. The system answers yes/no instantly by checking the hidden answer's tag value. The "possible answers" pool visibly shrinks. The used chip is replaced with the next most useful one.
6. Steps 3-5 repeat. Once the pool is small enough (e.g., <=5 candidates), a "Make a Guess" option appears with a shortlist.
7. The player guesses, or keeps narrowing with chips if unsure.
8. Result screen: reveal, number of taps used, streak status, and a shareable summary.

## 7. Functional Requirements (v1 scope)

| ID | Requirement |
|---|---|
| FR-1 | Daily hidden-answer generation, deterministic per day, single category |
| FR-2 | Chip generation: convert each remaining tag dimension into a plain-language yes/no chip |
| FR-3 | Chip ranking: surface the most informative 4-6 chips each turn, refreshed after every tap, computed with a plain scoring formula (see Section 9) |
| FR-4 | Instant yes/no resolution on chip tap, with candidate pool update |
| FR-5 | Low-signal flagging: chips that would only marginally split the pool are visually deprioritized (see Section 10) |
| FR-6 | "Make a Guess" flow: shortlist of remaining candidates once pool size crosses a threshold |
| FR-7 | Result screen: reveal, taps used, streak, share card |
| FR-8 | Practice mode (replay past daily puzzles) and archive mode |
| FR-9 | Basic analytics: start, completion, chip taps, guess attempts, abandon point |
| FR-10 | Daily answer must not be discoverable client-side before it's solved (see Section 15) |

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Instant-feeling load on mobile and desktop (target: interactive < 2s on mid-tier mobile) |
| UI | Mobile-first; large, thumb-friendly chip targets; no scrolling needed to see the current chip set |
| Friction | No account required for first play; no typing anywhere in the core loop |
| Reliability | Daily puzzle state resets correctly and consistently across the player's local day |
| Scalability | Answer/tag/chip schema and DB queries support growth from ~100 to several thousand answers without re-architecture (see Section 14) |
| Maintainability | No AI dependency in the runtime path; ranking logic is plain, testable code a small team can debug and extend |
| Observability | Log chip taps, drop-off points, guess attempts, success rates |
| Content safety | Answers and chip phrasings screened for offensive or confusing content via manual review (see Section 9) |
| Chip clarity | Every chip must resolve unambiguously (a clean yes or no) against every answer currently in the pool — enforced as a content-authoring QA gate |
| Fairness | The hidden answer is fixed before any chip is shown; the ranking engine only decides which chips to surface, never changes the underlying answer based on play |
| Security | The daily answer must not be exposed in client-side code, network responses, or page source before it's solved (see Section 15) |
| SEO | Marketing/landing/archive-listing pages must be crawlable static HTML; the live game screen is exempt since it isn't a search-landing surface |

## 9. Content & Ranking Pipeline (no AI required)

This replaces any AI-generation step with a manual, DB-driven pipeline appropriate for the current scale (100-150 answers, one category):

- **Content authoring** — answers, tags, and `chip_text` phrasings are written directly into the database by a human, using a simple internal form or spreadsheet import. No generation step needed.
- **Chip ranking (deterministic)** — for each remaining tag dimension, count how many of the currently-possible answers are "yes" vs "no." Score = how close that split is to 50/50. Surface the top 4-6 highest-scoring, not-yet-asked tags as chips. This is a single query or a few lines of application code — no model call, fully testable, fully predictable.
- **Ambiguity QA** — before a new answer goes live, a human checks that every existing chip phrasing resolves cleanly against it (a lightweight checklist, not automated review).
- **Moderation** — manual review of new content before publishing; no automated moderation needed at this scale.

This pipeline is intentionally low-tech at launch. It can later be augmented (not replaced) with AI as an authoring assistant — e.g., suggesting draft chip phrasings for a human to approve — without touching the runtime ranking logic, which stays deterministic regardless of scale (see Section 14).

## 10. UX Principles

- One screen carries almost the whole game: category name, "answers remaining" counter, a shrinking visual pool (e.g., fading icon grid), and the chip row.
- Chips are large, one-line, and instantly tappable — no typing, no menus.
- A tapped chip animates into a yes/no badge alongside the pool-shrink animation, then is replaced by the next-ranked chip.
- Chips that would only marginally narrow the pool (e.g., under ~15% either way) get a small "low-signal" indicator, letting the player choose to skip them — this replaces a formal hint system (see Section 11).
- "Make a Guess" only appears once the pool is small enough to be a meaningful action — not from turn one, to avoid decision fatigue early in the round.
- The reveal is dramatic but fast — no padded delay.
- Color states: green = strong narrowing progress, amber = pool stalling, blue = guess-ready.

## 11. Hint System

Because the player fully controls pacing by choosing which chip to tap, the classic "stuck" problem mostly disappears — there's no wrong path to wander down. The only remaining case is **pool stagnation**, where available chips all split the pool weakly. In that case, the top-ranked chip is labeled "low-signal" so the player can consciously choose it or wait for a better one to surface. There is no tiered hint ladder, no hint currency, and no hint UI in the default mode.

## 12. Data Model

```
Answer {
  id
  category
  label
  aliases[]
  difficulty
  commonness
  tags{}                  // size, region, use, living/non-living, etc.
  chip_text{}              // plain-language yes/no phrasing per tag
  daily_rotation_eligibility
}
```

`chip_text` is the field that makes this design work end-to-end: every tag dimension needs an authored, unambiguous, player-facing question phrasing (e.g., tag `size: large` -> chip text "Is it bigger than a cat?"). This schema is deliberately flat and simple — it needs no changes to support more categories or more answers, only more rows (see Section 14).

## 13. Retention Mechanics

- Daily puzzle as the core habit anchor — one natural stopping point per day.
- Streaks with gentle forgiveness (e.g., a streak freeze / grace mechanism — TBD).
- Visible, animated pool-shrink as a built-in reward loop — every tap visibly moves the player closer.
- A "close but not quite" near-miss state before the final reveal, to make the guess feel earned.
- Shareable result card built around **"solved in N taps"** rather than a question-path grid, since each player's chip order can differ — this keeps results comparable (lower N = better) while supporting the mechanic.

## 14. Built to Scale and Monetize Later

Simplicity now shouldn't foreclose growth later. Concretely:

**Scaling the content pool**
- The flat `Answer`/`tags`/`chip_text` schema (Section 12) supports going from ~150 answers to several thousand by adding rows, not by changing structure.
- The ranking query (Section 9) is a count-and-score operation over the current candidate pool — its cost scales with pool size, not with total answers in the DB, so it stays fast as the catalog grows. Standard DB indexing on `category` and `daily_rotation_eligibility` keeps this cheap.
- Adding a new category is additive — no changes to the ranking logic, only new rows and new `chip_text` entries.

**Scaling the team/process**
- Because authoring is manual (Section 9), growth here is a staffing/tooling question, not an engineering one. A basic internal content-editing tool (even a simple admin form) is worth building once the answer count outgrows spreadsheet editing — flagged as a fast-follow, not a v1 requirement.
- If/when AI-assisted content generation is reintroduced, it plugs in *upstream* of the DB (suggesting draft rows for human approval) — the runtime game and ranking logic never need to change.

**Monetization readiness**
- The `daily_rotation_eligibility` field already separates "in the free daily rotation" from "available," which is the same mechanism needed to gate premium-only puzzles or an extended archive later — no schema change required to introduce that split.
- Practice mode and archive mode (FR-8) are natural premium surfaces once usage data justifies a paywall — they're scoped in from day one specifically so the monetization hook doesn't require new infrastructure later.
- Analytics (FR-9) should track taps-to-solve and completion rate per answer/category from day one — this is the data that will justify pricing and paywall placement decisions later, so it needs to exist before you need it, not after.

## 15. Technical Architecture

The site should be mostly static for SEO and deployment simplicity, with a minimal server-side component added only where the game's integrity requires it.

**Frontend**
- Plain HTML/CSS/JS for marketing, rules, and archive-listing pages — these need to be crawlable and index well in search, and don't benefit from a framework.
- The live game screen can be JS-driven without SEO concerns, since it isn't a page anyone finds via search mid-session.
- Session/streak state (current-day progress, streak count, "already played today") stored in browser `localStorage`, the same pattern Wordle and similar games use — no login, no account system needed at launch. Trade-off: streaks don't sync across devices without an account system later, which is an acceptable v1 limitation.

**Why "fully static, zero backend" doesn't quite work here**
If the full answer pool and today's secret answer ship in the JS bundle so chip taps can resolve instantly client-side, the daily answer becomes readable by anyone who opens dev tools and inspects the source or network requests — this happened to early Wordle. That directly conflicts with the Fairness requirement (Section 8) and the retention design, both of which depend on the answer staying unknown until solved (FR-10).

**Minimal backend needed**
- One small serverless/edge function (e.g., a Cloudflare Pages Function or Worker) that:
  1. Serves the day's category and available chip questions, without revealing which candidate is the secret answer.
  2. Accepts a chip-tap request and returns yes/no by checking the answer server-side.
- This is a small addition, not a server to provision or manage — it deploys alongside the static site and scales automatically.
- The day's category/chip data is identical for every player, so it should be aggressively edge-cached to keep the function cheap even at scale.

**Hosting**
- Cloudflare Pages (or Netlify/Vercel) for the static site and serverless function, deployed via git push.
- Cloudflare Pages has the added benefit of sitting directly on Cloudflare's network, which brings the DDoS and rate-limiting protections below with no extra setup.

**Security & abuse protection**
- DDoS mitigation is automatic once the domain is proxied through Cloudflare (the "orange cloud" DNS setting) — this is a network-level protection, not something to build as a function.
- Add a Cloudflare rate-limiting rule on the chip-answer endpoint specifically, to prevent someone scripting repeated requests to brute-force or scrape the daily answer — a more realistic threat here than generic DDoS.
- Cloudflare Turnstile (free CAPTCHA alternative) is a fast-follow if bot abuse is actually observed on that endpoint — not needed at launch.

**Analytics**
- Firebase Analytics (free at this scale, no backend required) for event-level tracking — start, completion, chip taps, guess attempts (FR-9) — which is the data Section 14 says is needed to inform monetization decisions later.
- Cloudflare Web Analytics is a lightweight, privacy-respecting, cookie-free option worth adding alongside Firebase for infra-level traffic visibility; the two aren't mutually exclusive.

## 16. Monetization Hooks (v1 candidates)

- Full puzzle archive access.
- Streak stats / extended history.
- Ad-free mode.
- Longer-term: ads, subscriptions, sponsorships, or a Patreon-style support tier once the audience is durable.

Pricing, paywall placement, and free/paid feature split are intentionally not decided in this doc — see Gap 3 in Section 19.

## 17. Launch Plan

1. One category to start (not 2-3 — deliberately narrow scope for the first ship).
2. 100-150 total answers.
3. Every tag dimension in use has a fully authored `chip_text` phrasing.
4. Core loop only: daily mode + share card. Practice and archive modes follow once the core loop's completion rate is validated.
5. Expand categories and pool size once retention and share-through data support it — schema and ranking logic require no changes to do this (see Section 14).

## 18. Success Metrics

- D1 / D7 / D30 retention.
- Share-card click-through and conversion (share -> new session).
- Completion rate (started -> resolved).
- Average taps-to-solve, as a proxy for chip-ranking quality.
- Guess-attempt accuracy (how often the first guess is correct once "Make a Guess" appears).
- Free -> premium conversion once monetization ships.

---

## 19. Critique & Gaps

**1. Chip-set size is unvalidated.** Showing 4-6 chips per turn is a guess, not a tested number — too many could recreate the "complicated" feeling the earlier design had; too few could feel restrictive. This needs playtesting before launch, not after.

**2. Single daily category removes a decision, but also removes choice.** Dropping category-select simplifies onboarding, but it's untested whether players disengage on days when they dislike the day's topic. Worth watching completion rate by category once live.

**3. Monetization is still underspecified.** Premium hooks are named but not sized — no pricing, no paywall placement, no split between what's free vs. paid. This needs real numbers before launch, ideally informed by the taps-to-solve and completion data called out in Section 14.

**4. Chip clarity is a real content bottleneck.** The whole design's reliability depends on every chip resolving unambiguously against every answer in the pool. This is a non-trivial manual QA burden per answer added — worth prototyping the authoring/QA workflow early, since it will gate how fast the content pool can grow (mitigated in part by a future internal content tool, per Section 14).

**5. "Make a Guess" threshold needs a rule, not a feeling.** The pool size at which the guess option appears materially affects difficulty and pacing — this should be a tunable parameter validated by playtesting, not fixed arbitrarily.

**6. No accessibility notes for color-coded states.** Green/amber/blue states (Section 10) need a non-color signal (icon or text) for colorblind accessibility.

**7. Serverless function choice and DB choice aren't pinned down.** Section 15 specifies the *shape* of the backend (one small edge function, aggressively cached) but not the specific database or function runtime — worth deciding early since it affects local dev setup, but doesn't block starting on the frontend and content schema in parallel.

**8. No automated testing strategy mentioned.** Given the "chip clarity" and "fairness" requirements are correctness-critical, it's worth deciding early whether chip-resolution logic gets unit tests (recommended, since it's pure deterministic logic and cheap to test) rather than relying solely on manual QA.

---

*Next step: prototype the chip-count and "Make a Guess" threshold (gaps 1 and 5) on paper or in a quick clickable mock before writing any production code — both affect how the whole loop feels, and neither needs code to test.*
