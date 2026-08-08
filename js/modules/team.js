/**
 * TESTIMONIALS — Principle: Collaboration.
 *
 * The product sits at the centre; disciplines orbit it, scattered and
 * disconnected. Pressing "Connect" pulls them onto a circle and draws the
 * system: spokes from the product to each discipline, plus a ring between
 * neighbours. The network visibly becomes stronger — different perspectives →
 * alignment → a stronger product — and only then do the recommendations appear.
 */
import { prefersReducedMotion } from "./env.js";

export function initTeam() {
  const section = document.getElementById("testimonials");
  const team = document.getElementById("team");
  const nodesEl = document.getElementById("team-nodes");
  const wiresEl = document.getElementById("team-wires");
  const button = document.getElementById("testimonials-connect");
  if (!section || !team || !nodesEl || !wiresEl || !button) return;

  const all = [...nodesEl.querySelectorAll(".team-node")];
  const center = nodesEl.querySelector(".team-node--center") || all[0];
  const ring = all.filter((n) => n !== center);
  const n = ring.length;

  const cx = 50;
  const cy = 50;
  const rx = 33;
  const ry = 34;

  // Place the centre; place the ring evenly around it.
  center.style.left = `${cx}%`;
  center.style.top = `${cy}%`;
  const points = ring.map((_, i) => {
    const a = (-90 + (360 / n) * i) * (Math.PI / 180);
    return { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) };
  });

  // Deterministic scatter offsets for the disconnected state.
  const scatter = [
    { dx: -9, dy: -7 }, { dx: 10, dy: -6 }, { dx: 8, dy: 9 },
    { dx: -7, dy: 10 }, { dx: -11, dy: 2 }, { dx: 6, dy: -11 },
  ];
  ring.forEach((node, i) => {
    node.style.left = `${points[i].x}%`;
    node.style.top = `${points[i].y}%`;
    const s = scatter[i % scatter.length];
    node.style.setProperty("--scatter", `translate(${s.dx}%, ${s.dy}%)`);
  });

  // Wires: spokes (centre → each) then the neighbour ring.
  wiresEl.setAttribute("viewBox", "0 0 100 100");
  const NS = "http://www.w3.org/2000/svg";
  const line = (x1, y1, x2, y2, cls) => {
    const el = document.createElementNS(NS, "line");
    el.setAttribute("x1", x1); el.setAttribute("y1", y1);
    el.setAttribute("x2", x2); el.setAttribute("y2", y2);
    el.setAttribute("class", cls);
    const len = Math.hypot(x2 - x1, y2 - y1);
    el.style.setProperty("--len", len.toFixed(2));
    wiresEl.appendChild(el);
  };
  points.forEach((p) => line(cx, cy, p.x, p.y, "team__wire team__wire--spoke"));
  for (let i = 0; i < n; i++) {
    const a = points[i], b = points[(i + 1) % n];
    line(a.x, a.y, b.x, b.y, "team__wire team__wire--ring");
  }

  const reduce = prefersReducedMotion();
  const connect = (on) => {
    team.setAttribute("data-connected", String(on));
    section.setAttribute("data-state", on ? "connected" : "disconnected");
    button.setAttribute("aria-pressed", String(on));
    // Centering is handled by the CSS `translate` property; transform only
    // carries the scatter offset for the disconnected state.
    ring.forEach((node) => {
      node.style.transform = on || reduce ? "none" : "var(--scatter)";
    });
  };

  button.addEventListener("click", () => connect(button.getAttribute("aria-pressed") !== "true"));
  connect(false);
}
