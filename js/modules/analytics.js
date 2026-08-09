/**
 * ENGAGEMENT — real counts, never faked.
 *
 * Total visitors and appreciations are shown ONLY when a real backend is
 * configured via window.__PORTFOLIO_STATS_ENDPOINT. With no endpoint the
 * appreciation still works as a personal acknowledgment, but no global numbers
 * are displayed and none are invented. To enable real totals, deploy the tiny
 * counter in docs/analytics.md and set the endpoint URL in index.html.
 *
 * Endpoint contract (simplest possible):
 *   GET  <endpoint>            -> { "visitors": N, "likes": M }
 *   POST <endpoint> {type:...} -> increments "visit" | "like", returns the same
 * No personal data is sent or stored — just two integer counters.
 */
const ENDPOINT = (typeof window !== "undefined" && window.__PORTFOLIO_STATS_ENDPOINT) || "";
const LS_VISIT = "at_visited_v1";
const LS_LIKE = "at_liked_v1";

function render(stats) {
  if (!stats) return;
  const wrap = document.getElementById("appreciate-stats");
  if (!wrap) return;
  const likes = document.getElementById("stat-likes");
  const visitors = document.getElementById("stat-visitors");
  if (likes && typeof stats.likes === "number") likes.textContent = stats.likes.toLocaleString();
  if (visitors && typeof stats.visitors === "number") visitors.textContent = stats.visitors.toLocaleString();
  wrap.hidden = false;
}

async function post(type) {
  if (!ENDPOINT) return null;
  try {
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    return r.ok ? await r.json() : null;
  } catch { return null; }
}
async function getStats() {
  if (!ENDPOINT) return null;
  try { const r = await fetch(ENDPOINT); return r.ok ? await r.json() : null; } catch { return null; }
}

export function hasLiked() {
  try { return localStorage.getItem(LS_LIKE) === "1"; } catch { return false; }
}

/** Record one appreciation (deduped per browser). Updates the display if real. */
export async function sendLike() {
  let already = false;
  try {
    already = localStorage.getItem(LS_LIKE) === "1";
    localStorage.setItem(LS_LIKE, "1");
  } catch {}
  const stats = already ? await getStats() : await post("like");
  if (stats) render(stats);
}

/** Count the visit (once per browser per day) and show real totals, if any. */
export async function initAnalytics() {
  if (!ENDPOINT) return; // no backend → show nothing, fake nothing
  let counted = false;
  try {
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(LS_VISIT) !== today) { localStorage.setItem(LS_VISIT, today); counted = true; }
  } catch {}
  const stats = counted ? await post("visit") : await getStats();
  if (stats) render(stats);
}
