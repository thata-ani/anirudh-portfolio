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

## The nine sections (Foundation v2.0, locked)

01 Hero · 02 What I Believe · 03 Selected Work · 04 Companies I've Built With ·
05 My Process · 06 The Principles Behind My Work · 07 Testimonials ·
08 Experience · 09 Let's Build Products Together

## The five principle-interactions

| Section | Principle | Interaction |
| --- | --- | --- |
| Hero | **Accessibility** | The page begins in the dark; pull the cord on the hanging light to switch it on and reveal the interface. |
| Selected Work | **Information Architecture** | Projects start scattered; *Organize* aligns them into a clean editorial grid. |
| The Principles Behind My Work | **Clarity** | The principles start visually complex; *Think Simple* resolves them into readable form. |
| Testimonials | **Collaboration** | A disconnected cross-functional team connects into a mesh — then the testimonials appear. |
| Let's Build Products Together | **Connection** | On arrival the button makes one subtle move, a single premium tone plays, and supported devices get a light haptic. |

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
