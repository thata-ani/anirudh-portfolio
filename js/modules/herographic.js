/**
 * HERO GRAPHIC — visibility / discoverability, shown (not named).
 *
 * A full-bleed field of "information" points rests almost invisible. A soft
 * light of attention travels across it — and only what the light reaches
 * becomes visible: the points brighten, grow, and lightly resolve into
 * structure. The rest waits in the dark. The visitor *feels* the principle:
 * in a product, important information has to be made visible to exist.
 * Classic, monochrome, restrained — a product graphic, not decoration.
 */
import { prefersReducedMotion } from "./env.js";

export function initHeroGraphic() {
  const canvas = document.getElementById("hero-canvas");
  const hero = document.getElementById("hero");
  if (!canvas || !hero) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const GAP = 32;
  const INK = "11, 11, 12";
  let w = 0, h = 0, dpr = 1;
  let cols = 0, rows = 0, ox = 0, oy = 0;
  const reduce = prefersReducedMotion();

  // Focal point (where the light of attention is). fx/fy ease toward tx/ty.
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
    // default focal: the open right/lower field, away from the copy
    tx = fx = w * 0.68;
    ty = fy = h * 0.52;
  };

  // Beam reach scales with the viewport diagonal.
  const R = () => Math.hypot(w, h) * 0.32;

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    const radius = R();
    const inv = 1 / radius;

    // Precompute reveal strength per grid node once, reuse for dots + links.
    const n = new Float32Array(cols * rows);
    for (let r = 0; r < rows; r++) {
      const y = oy + r * GAP;
      for (let c = 0; c < cols; c++) {
        const x = ox + c * GAP;
        let s = 1 - Math.hypot(x - fx, y - fy) * inv;
        if (s < 0) s = 0;
        s = s * s * (3 - 2 * s); // smoothstep
        n[r * cols + c] = s;
      }
    }

    // Structure — faint lattice that only forms where the light is strong,
    // so information reads as "becoming discoverable", not random noise.
    ctx.lineWidth = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const s = n[r * cols + c];
        if (s < 0.55) continue;
        const x = ox + c * GAP, y = oy + r * GAP;
        if (c + 1 < cols) {
          const s2 = n[r * cols + c + 1];
          if (s2 > 0.55) {
            const a = (Math.min(s, s2) - 0.55) * 0.5;
            ctx.strokeStyle = `rgba(${INK}, ${a.toFixed(3)})`;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + GAP, y); ctx.stroke();
          }
        }
        if (r + 1 < rows) {
          const s2 = n[(r + 1) * cols + c];
          if (s2 > 0.55) {
            const a = (Math.min(s, s2) - 0.55) * 0.5;
            ctx.strokeStyle = `rgba(${INK}, ${a.toFixed(3)})`;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + GAP); ctx.stroke();
          }
        }
      }
    }

    // The information points.
    for (let r = 0; r < rows; r++) {
      const y = oy + r * GAP;
      for (let c = 0; c < cols; c++) {
        const s = n[r * cols + c];
        const x = ox + c * GAP;
        const a = 0.05 + s * 0.72;
        const rr = 1 + s * 2.4;
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${INK}, ${a.toFixed(3)})`;
        ctx.fill();
        // a soft halo on the points the light lands on most directly
        if (s > 0.82) {
          ctx.beginPath();
          ctx.arc(x, y, rr + 4, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${INK}, ${((s - 0.82) * 0.6).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  };

  let t = 0, raf = 0;
  const tick = () => {
    t += 0.006;
    if (!pointerActive) {
      // a slow figure that roams the whole open field (incl. the lower area)
      tx = w * (0.6 + Math.cos(t) * 0.22);
      ty = h * (0.5 + Math.sin(t * 0.9) * 0.3);
    }
    fx += (tx - fx) * 0.055;
    fy += (ty - fy) * 0.055;
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
