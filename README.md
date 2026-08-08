# Anirudh Thata — Senior Product Designer

A portfolio built to be **experienced, not just read**. It's a single continuous,
dark, editorial space lit by one warm light that travels the page as you scroll —
and five moments where the visitor *does* something that demonstrates a Product
Design principle before reading about it.

> Designing Products That Scale. Solving Problems That Matter.

## Creative direction

- **Premium editorial product experience** — dark, warm, typographic, continuous.
- **One warm light** is the only accent and the only colour event, and the
  connective tissue between sections (it never resets — it travels).
- **Architecture** informs only *space, light, proportion, and composition*.
- **Typography leads**; imagery is supporting evidence. Product work is presented
  as framed artifacts, given air.
- **Motion is calm** — smooth, eased, no bounce or spectacle.

## The eleven sections (locked)

01 Hero · 02 How I Create Product Impact · 03 Scale & Proven Impact ·
04 Selected Product Work · 05 Leadership Beyond Design · 06 My Decision-Making
Framework · 07 Driving Innovation · 08 How I Think · 09 Career Journey ·
10 Recommendations · 11 Let's Build What's Next

## The five principle-interactions

| Section | Principle | Interaction |
| --- | --- | --- |
| Hero | **Accessibility** | The page begins almost inaccessible; *Switch ON* brings up the light and reveals the interface. |
| Selected Product Work | **Information Architecture** | Cropwise's initiatives start scattered; *Organize* aligns them into the system. |
| My Decision-Making Framework | **Clarity** | The four dimensions start visually complex; *Simplify* resolves them. |
| Recommendations | **Collaboration** | A disconnected cross-functional team connects into a mesh — then the recommendations appear. |
| Let's Build What's Next | **Connection** | *Get in Touch* plays a single subtle, premium notification tone. |

## Tech

Zero dependencies, no build step. Semantic HTML, tokenised modern CSS, and small
ES modules — one per interaction, plus the continuous light field.

```
index.html
css/  tokens · base · layout · sections
js/   main.js + modules/ (env, lightfield, hero, nav, reveal, team, contact, state-toggle)
assets/  architectural SVG studies + favicon
```

- **Progressive enhancement** — fully readable without JS (`html.js` gates every
  JS-dependent hidden state).
- **Accessibility** — semantic landmarks, real `role="switch"`, focus hand-off,
  visible focus, full `prefers-reduced-motion` support (light static, no parallax).
- **Performance** — no frameworks, SVG-only imagery, non-render-blocking fonts.

## Asset slots (swap when available)

- `assets/anirudh-thata-resume.pdf` — résumé download (Hero + Contact).
- Real Cropwise Grower / DesignBesti product screens (Selected Product Work) —
  currently abstract lit placeholders.
- Company logos (Career) — text-only until provided.

## Run locally

```bash
python3 -m http.server 8000   # ES modules need HTTP, not file://
# open http://localhost:8000
```

---

Anirudh Thata · Senior Product Designer · Pune, India
