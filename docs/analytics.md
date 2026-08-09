# Real engagement counters (visitors · appreciations)

The site can show **real** totals — total visitors and total appreciations — but a
static GitHub Pages site has no server, so a tiny counter backend is required.
Nothing is ever faked: with no backend configured, the "Like what you experienced"
button still works as a personal acknowledgment, but **no numbers are shown**.

You only need to do this once. It's free and ~5 minutes.

## What the site expects

A single URL that answers:

- `GET  <endpoint>`               → `{ "visitors": N, "likes": M }`
- `POST <endpoint>` `{ "type": "visit" }` → increments visitors, returns the object
- `POST <endpoint>` `{ "type": "like"  }` → increments likes, returns the object

No personal data is sent or stored — just two integers. The browser de-dupes so a
visitor is counted once/day and an appreciation once per browser.

## Simplest implementation — Cloudflare Worker + KV (free)

1. Create a free Cloudflare account → **Workers & Pages** → **Create Worker**.
2. Add a **KV namespace** (e.g. `PORTFOLIO`) and bind it to the Worker as `STATS`.
3. Paste this Worker code and deploy:

```js
export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const read = async (k) => parseInt((await env.STATS.get(k)) || "0", 10);
    const bump = async (k) => { const v = (await read(k)) + 1; await env.STATS.put(k, String(v)); return v; };

    let visitors = await read("visitors");
    let likes = await read("likes");

    if (request.method === "POST") {
      const { type } = await request.json().catch(() => ({}));
      if (type === "visit") visitors = await bump("visitors");
      if (type === "like")  likes = await bump("likes");
    }
    return new Response(JSON.stringify({ visitors, likes }), {
      headers: { "Content-Type": "application/json", ...cors },
    });
  },
};
```

4. Copy the Worker URL (e.g. `https://portfolio-stats.<you>.workers.dev`).
5. In `index.html`, set the endpoint:

```html
<script>window.__PORTFOLIO_STATS_ENDPOINT = "https://portfolio-stats.<you>.workers.dev";</script>
```

Deploy the site — the "N appreciations · M visitors" line will now show real,
live totals.

## Alternatives

- **Supabase** (free): a `stats` table with two rows + an RPC to increment; call
  it with the anon key. Same client contract.
- Any privacy-friendly analytics (GoatCounter, Plausible) can provide visitor
  counts, but they won't capture the custom "appreciation" action — the Worker
  above is the smallest thing that does both.

## Privacy

Only two aggregate integers are stored. No IPs, cookies, or identifiers are
persisted by the counter. De-duplication happens client-side via `localStorage`.
