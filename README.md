# Anirudh Thata — Product Designer Portfolio

A portfolio built to be **experienced, not just read**. Every interaction
teaches one Product Design principle — the visitor feels the principle before
they read about it.

> Design isn't the act of making interfaces. It's the discipline of reducing
> uncertainty.

## The idea

Each section demonstrates a principle through interaction:

| Section | Principle | Interaction |
| --- | --- | --- |
| Hero | **Accessibility** | The page begins almost inaccessible — only the light. *Switch ON* reveals the interface, staggered, as the light spreads. |
| Selected Work | **Information Architecture** | Cards start scattered and overlapping. *Organize* aligns them into a clean editorial grid. |
| Principles | **Clarity** | The principles start visually difficult. *Simplify* makes them clear and readable. |
| Testimonials | **Collaboration** | The cross-functional team starts disconnected. *Connect* draws the mesh — and only then do the testimonials appear. |
| Contact | **Connection** | *Get in Touch* plays a single subtle, premium notification tone — a conversation beginning. |

## Design direction

- **Dark premium interface** — almost-black ground, warm-white type.
- **One accent**: a single warm architectural light.
- **Typography**: Inter Tight with a system fallback stack (SF Pro / Söhne).
- **Imagery**: monolithic, brutalist concrete rendered as crafted SVG — a
  metaphor for reducing uncertainty and revealing clarity. No stock photos.
- **Motion**: calm and intentional. No bounce, no overshoot.

## Tech

Zero dependencies, no build step. Semantic HTML, modern CSS with design tokens,
and small ES modules — one per interaction.

```
index.html
css/
  tokens.css      # design tokens (colour, type, motion, spacing)
  base.css        # reset, typography, buttons, reveal primitives
  layout.css      # shell, nav, section rhythm, hero reveal orchestration
  sections.css    # per-section styling + the interactive states
js/
  main.js         # wires the modules together
  modules/        # env, hero, nav, reveal, marquee, team, contact, state-toggle
assets/           # architectural SVGs + favicon
```

### Craft notes

- **Progressive enhancement** — the full page is readable without JavaScript;
  the interactions are enhancements layered on top (`html.js` gates every
  JS-dependent hidden state).
- **Accessibility** — semantic landmarks, a real `role="switch"`, focus
  hand-off after the reveal, visible focus rings, and full
  `prefers-reduced-motion` support.
- **Performance** — no frameworks, no images to download (SVG only), fonts
  loaded non-render-blocking.

## Run locally

It's static — serve the folder over HTTP (ES modules need a server, not
`file://`):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

---

Anirudh Thata · Lead Product Designer · Pune, India
