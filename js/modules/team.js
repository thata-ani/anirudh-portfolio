/**
 * TESTIMONIALS — Principle: Collaboration.
 *
 * A circular product ecosystem. Six disciplines rest apart on a circle; the
 * central action ("Bring them together") is the product forming at the centre.
 * Activating it draws the spokes from the centre to each discipline and closes
 * the ring around them — separate perspectives → connected perspectives →
 * one aligned product — and only then do the recommendations appear.
 *
 * Labels are anchored OUTSIDE the ring (radially), so the network lines never
 * cross the type.
 */
import { prefersReducedMotion } from "./env.js";

export function initTeam() {
  const section = document.getElementById("testimonials");
  const eco = document.getElementById("team");
  const nodesEl = document.getElementById("team-nodes");
  const wiresEl = document.getElementById("team-wires");
  const ring = document.getElementById("eco-ring");
  const button = document.getElementById("testimonials-connect");
  if (!section || !eco || !nodesEl || !wiresEl || !ring || !button) return;

  const nodes = [...nodesEl.querySelectorAll(".eco-node")];
  const n = nodes.length;
  const cx = 50, cy = 50, R = 36; // matches the ring radius in the markup
  const dotR = 16, gap = 10;      // px clearance from the face to its label
  const NS = "http://www.w3.org/2000/svg";

  // Deterministic "apart" offsets for the disconnected state.
  const scatter = [
    { dx: -7, dy: -8 }, { dx: 9, dy: -6 }, { dx: 8, dy: 8 },
    { dx: -6, dy: 9 }, { dx: -10, dy: 2 }, { dx: 7, dy: -4 },
  ];

  const geom = nodes.map((_, i) => {
    const a = (-90 + (360 / n) * i) * (Math.PI / 180);
    const ux = Math.cos(a), uy = Math.sin(a);
    return { ux, uy, x: cx + R * ux, y: cy + R * uy };
  });

  const mkLine = (x1, y1, x2, y2, cls, idx) => {
    const l = document.createElementNS(NS, "line");
    l.setAttribute("x1", x1); l.setAttribute("y1", y1);
    l.setAttribute("x2", x2); l.setAttribute("y2", y2);
    l.setAttribute("class", cls);
    l.style.setProperty("--i", idx);
    wiresEl.insertBefore(l, ring); // all wires sit beneath the ring
  };

  // Full mesh first (every discipline connects to every other), drawn faint —
  // so when connected, ALL perspectives are linked, not just to the centre.
  let li = 0;
  for (let i = 0; i < geom.length; i++) {
    for (let j = i + 1; j < geom.length; j++) {
      mkLine(geom[i].x, geom[i].y, geom[j].x, geom[j].y, "eco-link", li++);
    }
  }

  // A little face per discipline: a frown while apart, a smile once together.
  const FACE =
    '<svg class="eco-face" viewBox="0 0 28 28" aria-hidden="true">' +
    '<circle cx="10" cy="12" r="1.7"/><circle cx="18" cy="12" r="1.7"/>' +
    '<path class="mouth mouth--sad" d="M9 19 Q14 15 19 19"/>' +
    '<path class="mouth mouth--happy" d="M9 16 Q14 21 19 16"/>' +
    "</svg>";

  // Position nodes; spokes (centre product → each discipline) on top of the mesh.
  geom.forEach((g, i) => {
    const node = nodes[i];
    node.style.left = `${g.x}%`;
    node.style.top = `${g.y}%`;
    const dot = node.querySelector(".eco-node__dot");
    if (dot) dot.innerHTML = FACE;
    const s = scatter[i % scatter.length];
    node.style.setProperty("--scatter", `translate(${s.dx}%, ${s.dy}%)`);
    mkLine(cx, cy, g.x, g.y, "eco-spoke", i);
  });

  // Anchor each label just outside its dot. On wide layouts the side labels
  // sit left/right (radial); on narrow ones they stack above/below so they
  // never run off-screen. Re-evaluated on resize.
  const placeLabels = () => {
    const narrow = eco.getBoundingClientRect().width < 420;
    geom.forEach((g, i) => {
      const label = nodes[i].querySelector(".eco-node__label");
      label.style.top = "50%";
      label.style.left = "50%";
      const horizontal = !narrow && Math.abs(g.ux) >= Math.abs(g.uy);
      if (horizontal && g.ux > 0) {
        label.style.transform = `translate(${dotR + gap}px, -50%)`; label.style.textAlign = "left";
      } else if (horizontal) {
        label.style.transform = `translate(calc(-100% - ${dotR + gap}px), -50%)`; label.style.textAlign = "right";
      } else {
        label.style.textAlign = "center";
        label.style.transform = g.uy > 0
          ? `translate(-50%, ${dotR + gap}px)`
          : `translate(-50%, calc(-100% - ${dotR + gap}px))`;
      }
    });
  };
  placeLabels();
  window.addEventListener("resize", placeLabels, { passive: true });

  const reduce = prefersReducedMotion();
  const connect = (on) => {
    eco.setAttribute("data-connected", String(on));
    section.setAttribute("data-state", on ? "connected" : "disconnected");
    button.setAttribute("aria-pressed", String(on));
    nodes.forEach((node) => { node.style.transform = on || reduce ? "none" : "var(--scatter)"; });
  };
  button.addEventListener("click", () => connect(button.getAttribute("aria-pressed") !== "true"));
  connect(reduce); // reduced motion → start connected & readable; otherwise apart
}
