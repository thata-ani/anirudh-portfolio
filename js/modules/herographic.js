/**
 * HERO GRAPHIC — visibility, shown (not named).
 *
 * A precise grid of "information" dots that stay nearly invisible until a soft
 * light of attention passes over them — then they resolve into view. It drifts
 * on its own and follows the pointer, so the visitor feels the principle: what
 * the light reaches becomes visible; the rest waits in the dark. Classic,
 * monochrome, restrained — a product graphic, not decoration.
 */
import { prefersReducedMotion } from "./env.js";

export function initHeroGraphic() {
  const canvas = document.getElementById("hero-canvas");
  const hero = document.getElementById("hero");
  if (!canvas || !hero) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const GAP = 30;
  let w = 0, h = 0, dpr = 1, dots = [];
  const reduce = prefersReducedMotion();

  // Focal point (where attention/light is). Target eases toward this.
  let fx = 0, fy = 0, tx = 0, ty = 0;
  let pointerActive = false;

  const build = () => {
    const r = hero.getBoundingClientRect();
    w = r.width; h = r.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dots = [];
    const ox = (w % GAP) / 2, oy = (h % GAP) / 2;
    for (let y = oy; y <= h; y += GAP) {
      for (let x = ox; x <= w; x += GAP) dots.push({ x, y });
    }
    // default focal: right of the text column
    tx = fx = w * 0.64;
    ty = fy = h * 0.42;
  };

  const R = () => Math.hypot(w, h) * 0.4;

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    const radius = R();
    for (const d of dots) {
      const dist = Math.hypot(d.x - fx, d.y - fy);
      let n = Math.max(0, 1 - dist / radius);
      n = n * n * (3 - 2 * n); // smoothstep
      if (n <= 0.001) continue;
      // keep the left (text) column quiet so copy stays readable
      const leftGuard = Math.min(1, Math.max(0.25, d.x / (w * 0.5)));
      const a = (0.05 + n * 0.5) * leftGuard;
      const rr = 0.9 + n * 1.7;
      ctx.beginPath();
      ctx.arc(d.x, d.y, rr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(11, 11, 12, ${a.toFixed(3)})`;
      ctx.fill();
    }
  };

  let t = 0, raf = 0;
  const tick = () => {
    t += 0.008;
    if (!pointerActive) {
      // gentle autonomous drift in the right half
      tx = w * (0.6 + Math.cos(t) * 0.12);
      ty = h * (0.45 + Math.sin(t * 0.8) * 0.16);
    }
    fx += (tx - fx) * 0.06;
    fy += (ty - fy) * 0.06;
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

  // Start once the lights come on (and immediately if already on).
  const root = document.documentElement;
  if (root.getAttribute("data-reveal") === "on") start();
  else new MutationObserver((_, obs) => {
    if (root.getAttribute("data-reveal") === "on") { start(); obs.disconnect(); }
  }).observe(root, { attributes: true, attributeFilter: ["data-reveal"] });
}
