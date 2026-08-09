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
  const dotR = 7, gap = 12;       // px clearance from a dot to its label
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

  // Position nodes + spokes once.
  geom.forEach((g, i) => {
    const node = nodes[i];
    node.style.left = `${g.x}%`;
    node.style.top = `${g.y}%`;
    const s = scatter[i % scatter.length];
    node.style.setProperty("--scatter", `translate(${s.dx}%, ${s.dy}%)`);
    const l = document.createElementNS(NS, "line");
    l.setAttribute("x1", cx); l.setAttribute("y1", cy);
    l.setAttribute("x2", g.x); l.setAttribute("y2", g.y);
    l.setAttribute("class", "eco-spoke");
    l.style.setProperty("--i", i);
    wiresEl.insertBefore(l, ring);
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
