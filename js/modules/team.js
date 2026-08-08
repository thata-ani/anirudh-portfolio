/**
 * TESTIMONIALS — Principle: Collaboration.
 *
 * Cross-functional roles start scattered and disconnected. Pressing "Connect"
 * pulls them into a balanced constellation and draws the mesh between them —
 * and only then do the testimonials appear. Great products are built together;
 * the quotes are earned by the act of connecting the team.
 */
import { prefersReducedMotion } from "./env.js";

export function initTeam() {
  const section = document.getElementById("testimonials");
  const team = document.getElementById("team");
  const nodesEl = document.getElementById("team-nodes");
  const wiresEl = document.getElementById("team-wires");
  const button = document.getElementById("testimonials-connect");
  if (!section || !team || !nodesEl || !wiresEl || !button) return;

  const nodes = [...nodesEl.querySelectorAll(".team-node")];
  const count = nodes.length;

  // Balanced ring layout (percentages within the team box).
  const cx = 50;
  const cy = 50;
  const rx = 34;
  const ry = 36;
  const points = nodes.map((_, i) => {
    const angle = (-90 + (360 / count) * i) * (Math.PI / 180);
    return { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
  });

  // Fixed, deterministic scatter offsets for the disconnected state (no RNG,
  // so the layout is stable across loads and resize).
  const scatter = [
    { dx: -7, dy: -9 },
    { dx: 9, dy: -5 },
    { dx: 6, dy: 8 },
    { dx: -8, dy: 7 },
    { dx: 2, dy: -11 },
  ];

  nodes.forEach((node, i) => {
    node.style.left = `${points[i].x}%`;
    node.style.top = `${points[i].y}%`;
    const s = scatter[i % scatter.length];
    node.style.setProperty("--scatter", `translate(${s.dx}%, ${s.dy}%)`);
    node.style.transform = `var(--scatter)`;
  });

  // Draw a line between every pair — the collaboration mesh.
  wiresEl.setAttribute("viewBox", "0 0 100 100");
  const NS = "http://www.w3.org/2000/svg";
  for (let a = 0; a < count; a++) {
    for (let b = a + 1; b < count; b++) {
      const line = document.createElementNS(NS, "line");
      line.setAttribute("x1", points[a].x);
      line.setAttribute("y1", points[a].y);
      line.setAttribute("x2", points[b].x);
      line.setAttribute("y2", points[b].y);
      line.setAttribute("class", "team__wire");
      const len = Math.hypot(points[b].x - points[a].x, points[b].y - points[a].y);
      line.style.setProperty("--len", len.toFixed(2));
      wiresEl.appendChild(line);
    }
  }

  const reduce = prefersReducedMotion();

  const connect = (isOn) => {
    team.setAttribute("data-connected", String(isOn));
    section.setAttribute("data-state", isOn ? "connected" : "disconnected");
    button.setAttribute("aria-pressed", String(isOn));
    nodes.forEach((node) => {
      // No positional jitter under reduced motion — still fully functional.
      node.style.transform = isOn || reduce ? "translate(0, 0)" : "var(--scatter)";
    });
  };

  button.addEventListener("click", () => {
    connect(button.getAttribute("aria-pressed") !== "true");
  });

  connect(false);
}
