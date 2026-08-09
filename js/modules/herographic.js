/**
 * HERO GRAPHIC — a quiet field of information, lightly touched by attention.
 *
 * A restrained grid of dots rests almost invisible. Where a soft focus passes
 * — drifting on its own, gently following the pointer — the dots lift just
 * enough to notice. It is deliberately subtle: a detail the visitor discovers
 * after a moment, never something that competes with the hero content. The
 * principle (visibility / discoverability) is present, not loud.
 */
import { prefersReducedMotion } from "./env.js";

export function initHeroGraphic() {
  const canvas = document.getElementById("hero-canvas");
  const hero = document.getElementById("hero");
  if (!canvas || !hero) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const GAP = 34;
  const INK = "11, 11, 12";
  let w = 0, h = 0, dpr = 1;
  let cols = 0, rows = 0, ox = 0, oy = 0;
  const reduce = prefersReducedMotion();

  let fx = 0, fy = 0, tx = 0, ty = 0;
  let pointerActive = false;

  const build = () => {
    const r = hero.getBoundingClientRect();
    w = r.width; h = r.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.floor(w / GAP);
    rows = Math.floor(h / GAP);
    ox = (w - cols * GAP) / 2 + GAP / 2;
    oy = (h - rows * GAP) / 2 + GAP / 2;
    tx = fx = w * 0.7;
    ty = fy = h * 0.55;
  };

  // A gentle, local reveal — small reach, low contrast.
  const R = () => Math.hypot(w, h) * 0.24;

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    const radius = R();
    const inv = 1 / radius;
    for (let r = 0; r < rows; r++) {
      const y = oy + r * GAP;
      for (let c = 0; c < cols; c++) {
        const x = ox + c * GAP;
        let s = 1 - Math.hypot(x - fx, y - fy) * inv;
        if (s < 0) s = 0;
        s = s * s * (3 - 2 * s); // smoothstep
        const a = 0.03 + s * 0.24;         // quiet base, restrained reveal
        const rr = 0.8 + s * 1.2;          // small dots
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${INK}, ${a.toFixed(3)})`;
        ctx.fill();
      }
    }
  };

  let t = 0, raf = 0;
  const tick = () => {
    t += 0.004; // slow drift
    if (!pointerActive) {
      tx = w * (0.62 + Math.cos(t) * 0.18);
      ty = h * (0.55 + Math.sin(t * 0.9) * 0.22);
    }
    fx += (tx - fx) * 0.04; // eases gently, never snappy
    fy += (ty - fy) * 0.04;
    draw();
    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (raf) return;
    if (reduce) { draw(); return; }
    raf = requestAnimationFrame(tick);
  };

  build();
  window.addEventListener("resize", () => { build(); if (reduce) draw(); }, { passive: true });

  if (!reduce) {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      pointerActive = true;
    });
    hero.addEventListener("pointerleave", () => { pointerActive = false; });
  }

  const root = document.documentElement;
  if (root.getAttribute("data-reveal") === "on") start();
  else new MutationObserver((_, obs) => {
    if (root.getAttribute("data-reveal") === "on") { start(); obs.disconnect(); }
  }).observe(root, { attributes: true, attributeFilter: ["data-reveal"] });
}
