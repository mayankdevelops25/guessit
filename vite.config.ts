import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { getDailyAnswer, getDailyCategory, puzzleNumber, toPublicCandidate } from "./src/lib/content";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dev mock — mirrors functions/api/* (session, state, share, chip, guess)
// Imports the SAME content module the Functions use, so categories never drift.
function mockBackend(): Plugin {
  const sessions = new Map<string, any>();
  const RATE = new Map<string, { count: number; reset: number }>();

  const isValidSid = (id: string) => typeof id === "string" && id.length >= 8 && id.length <= 128;
  const yesterdayStr = (d: string) => { const dt = new Date(d + "T12:00:00"); dt.setDate(dt.getDate() - 1); return dt.toISOString().split("T")[0]; };
  const isConsecutive = (last: string | null, cur: string) => (last ? yesterdayStr(cur) === last : false);
  const getSession = (id: string) => sessions.get(id) || null;
  const putSession = (s: any) => { sessions.set(s.id, s); };
  const newSession = (id: string) => ({
    id, createdAt: Date.now(), lastSeen: Date.now(),
    streak: { count: 0, lastDate: null, freezeAvailable: true },
    history: {}, states: {},
  });
  const simpleHash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h).toString(36); };

  return {
    name: "mock-backend",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next();
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Session-Id, X-Client-Time");
        if (req.method === "OPTIONS") { res.statusCode = 204; res.end(); return; }

        const url = new URL(req.url!, `http://${req.headers.host}`);
        const pathname = url.pathname;
        const sid = (req.headers["x-session-id"] as string) || url.searchParams.get("sid") || "";
        const json = (data: any, status = 200) => { res.statusCode = status; res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(data)); };
        const readBody = async () => { const chunks: Buffer[] = []; for await (const c of req) chunks.push(c as Buffer); const raw = Buffer.concat(chunks).toString(); try { return raw ? JSON.parse(raw) : null; } catch { return null; } };
        const isDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);

        // ── SESSION ──
        if (pathname === "/api/session") {
          if (req.method === "POST") {
            const id = isValidSid(sid) ? sid : "ss-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
            let sess = getSession(id);
            let isNew = false;
            if (!sess) { sess = newSession(id); isNew = true; }
            else sess.lastSeen = Date.now();
            putSession(sess);
            res.setHeader("Cache-Control", "no-store");
            res.setHeader("Set-Cookie", `gotd_sid=${sess.id}; Path=/; Max-Age=7776000; SameSite=Lax`);
            return json({ ok: true, session: { id: sess.id, createdAt: sess.createdAt, lastSeen: sess.lastSeen, streak: sess.streak, historyCount: Object.keys(sess.history).length }, isNew });
          }
          if (req.method === "GET") {
            if (!isValidSid(sid)) return json({ ok: false, error: "missing session" }, 401);
            const sess = getSession(sid);
            if (!sess) return json({ ok: false, error: "unknown session" }, 404);
            sess.lastSeen = Date.now(); putSession(sess);
            return json({ ok: true, session: { id: sess.id, createdAt: sess.createdAt, lastSeen: sess.lastSeen, streak: sess.streak, historyCount: Object.keys(sess.history).length }, isNew: false });
          }
        }

        // ── DAILY (category-aware) ──
        if (pathname === "/api/daily" && req.method === "GET") {
          const date = url.searchParams.get("date") || new Date().toISOString().split("T")[0];
          if (!isDate(date)) return json({ ok: false, error: "invalid date" }, 400);
          const cat = getDailyCategory(date);
          res.setHeader("Cache-Control", "public, max-age=60, s-maxage=86400");
          res.setHeader("X-Puzzle-No", String(puzzleNumber(date)));
          return json({
            date, puzzleNo: puzzleNumber(date), category: cat.id, categoryLabel: cat.label,
            total: cat.answers.length,
            candidates: cat.answers.map(toPublicCandidate),
            chips: cat.chips.map(c => ({ id: c.id, text: c.text })),
          });
        }

        if (pathname === "/api/health" && req.method === "GET") {
          return json({ ok: true, version: "1.2.0-categories", mode: "vite-dev-mock", time: new Date().toISOString(), features: ["daily", "chip", "guess", "analytics", "session", "state", "share", "categories"] });
        }

        // ── STATE ──
        if (pathname === "/api/state") {
          if (req.method === "GET") {
            const date = url.searchParams.get("date") || "";
            if (!isValidSid(sid)) return json({ ok: false, error: "missing session" }, 401);
            if (!isDate(date)) return json({ ok: false, error: "invalid date" }, 400);
            const sess = getSession(sid);
            if (!sess) return json({ ok: false, error: "unknown session" }, 404);
            return json({ ok: true, date, state: sess.states[date] || null });
          }
          if (req.method === "POST") {
            const body = (await readBody()) as any;
            if (!isValidSid(sid)) return json({ ok: false, error: "missing session" }, 401);
            if (!body?.date || !isDate(body.date)) return json({ ok: false, error: "invalid date" }, 400);
            if (!Array.isArray(body.asked) || body.asked.length !== body.taps) return json({ ok: false, error: "taps mismatch" }, 400);
            let sess = getSession(sid);
            if (!sess) { sess = newSession(sid); putSession(sess); }
            const existing = sess.states[body.date];
            if (existing?.completed && !body.completed) return json({ ok: true, date: body.date, state: existing });
            const next = { asked: body.asked.slice(0, 20), taps: body.taps, guessAttempts: Math.max(0, Math.min(10, Number(body.guessAttempts) || 0)), completed: !!body.completed, won: body.won === true ? true : body.won === false ? false : null, updatedAt: Date.now() };
            sess.states[body.date] = next;
            sess.lastSeen = Date.now();
            if (next.completed) sess.history[body.date] = { taps: body.taps, won: !!body.won, label: body.label || "Unknown", ts: Date.now() };
            putSession(sess);
            return json({ ok: true, date: body.date, state: next });
          }
        }

        // ── SHARE (signed) ──
        if (pathname === "/api/share" && req.method === "GET") {
          const date = url.searchParams.get("date") || "";
          if (!isValidSid(sid)) return json({ ok: false, error: "missing session" }, 401);
          if (!isDate(date)) return json({ ok: false, error: "invalid date" }, 400);
          const sess = getSession(sid);
          if (!sess) return json({ ok: false, error: "unknown session" }, 404);
          const st = sess.states[date];
          if (!st || !st.completed) return json({ ok: false, error: "puzzle not completed" }, 400);
          const grid = st.asked.map((a: any) => (a.result ? "🟩" : "🟥")).join("") || "—";
          const catLabel = getDailyCategory(date).label;
          const shareText = `Guess of the Day — Daily #${puzzleNumber(date)} · ${catLabel}\nSolved in ${st.taps} taps ${st.taps <= 3 ? "⚡️" : st.taps <= 5 ? "✨" : ""}\n${grid}\nStreak: ${sess.streak.count} 🔥\nguessofday.game`;
          return json({ ok: true, shareText, token: simpleHash(`${sid}:${date}:${st.taps}:gotd-v1-secret`), taps: st.taps, puzzleNo: puzzleNumber(date) });
        }

        // ── CHIP (category-scoped) ──
        if (pathname === "/api/chip" && req.method === "POST") {
          const body = (await readBody()) as any;
          if (!body?.date || !body?.chipId) return json({ ok: false, error: "missing date or chipId" }, 400);
          const rateKey = isValidSid(sid) ? `sess:${sid}:${body.date}` : `ip:${req.headers["x-forwarded-for"] || "local"}:${body.date}`;
          const now = Date.now(); const b = RATE.get(rateKey);
          if (b && b.reset > now && b.count > 80) return json({ ok: false, error: "rate limited" }, 429);
          if (!b || b.reset < now) RATE.set(rateKey, { count: 1, reset: now + 60_000 }); else b.count++;

          const chip = getDailyCategory(body.date).chips.find(c => c.id === body.chipId);
          if (!chip) return json({ ok: false, error: "unknown chip for this category" }, 404);
          if (isValidSid(sid)) {
            const sess = getSession(sid);
            if (sess?.states[body.date]?.completed) return json({ ok: false, error: "puzzle already completed" }, 409);
            if (sess?.states[body.date]?.asked?.some((a: any) => a.id === body.chipId)) return json({ ok: false, error: "chip already asked" }, 409);
          }
          const hidden = getDailyAnswer(body.date);
          const result = chip.check(hidden);
          if (isValidSid(sid)) {
            let sess = getSession(sid); if (!sess) { sess = newSession(sid); putSession(sess); }
            const st = sess.states[body.date] || { asked: [], taps: 0, guessAttempts: 0, completed: false, won: null, updatedAt: Date.now() };
            st.asked.push({ id: body.chipId, text: chip.text, result }); st.taps = st.asked.length; st.updatedAt = Date.now();
            sess.states[body.date] = st; sess.lastSeen = Date.now(); putSession(sess);
          }
          return json({ ok: true, chipId: body.chipId, result, chipText: chip.text, remaining: -1 });
        }

        // ── GUESS (server-validated streak) ──
        if (pathname === "/api/guess" && req.method === "POST") {
          const body = (await readBody()) as any;
          if (!body?.date || !body?.guessId) return json({ ok: false, error: "missing date or guessId" }, 400);
          const cat = getDailyCategory(body.date);
          if (!cat.answers.some(a => a.id === body.guessId)) return json({ ok: false, error: "unknown answer for this category" }, 404);
          const hidden = getDailyAnswer(body.date);
          const correct = hidden.id === body.guessId;
          let streakOut: any;
          if (isValidSid(sid)) {
            let sess = getSession(sid); if (!sess) { sess = newSession(sid); putSession(sess); }
            const alreadyCompleted = sess.states[body.date]?.completed && sess.states[body.date]?.won === true;
            if (correct && !alreadyCompleted) {
              const last = sess.streak.lastDate;
              if (!last) sess.streak = { count: 1, lastDate: body.date, freezeAvailable: true };
              else if (last === body.date) { /* idempotent */ }
              else if (isConsecutive(last, body.date)) sess.streak = { count: sess.streak.count + 1, lastDate: body.date, freezeAvailable: sess.streak.freezeAvailable };
              else {
                const gap = Math.round((new Date(body.date + "T12:00:00").getTime() - new Date(last + "T12:00:00").getTime()) / 86400000);
                if (gap === 2 && sess.streak.freezeAvailable) sess.streak = { count: sess.streak.count + 1, lastDate: body.date, freezeAvailable: false };
                else sess.streak = { count: 1, lastDate: body.date, freezeAvailable: true };
              }
            }
            const st = sess.states[body.date] || { asked: [], taps: 0, guessAttempts: 0, completed: false, won: null, updatedAt: Date.now() };
            st.guessAttempts = (st.guessAttempts || 0) + 1; st.updatedAt = Date.now();
            if (correct) { st.completed = true; st.won = true; sess.history[body.date] = { taps: st.taps, won: true, label: hidden.label, ts: Date.now() }; }
            sess.states[body.date] = st; sess.lastSeen = Date.now(); putSession(sess);
            streakOut = { count: sess.streak.count, lastDate: sess.streak.lastDate };
          }
          const payload: any = { ok: true, correct, guessId: body.guessId, attempts: 1, streak: streakOut };
          if (correct) payload.answer = toPublicCandidate(hidden);
          return json(payload);
        }

        if (pathname === "/api/analytics" && req.method === "POST") {
          const body = await readBody();
          console.log("[analytics:dev]", body, sid ? `(sid ${sid.slice(0, 8)}…)` : "");
          return json({ ok: true });
        }

        return next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile(), mockBackend()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
