/**
 * SELECTED WORK — Principle: Information Architecture.
 *
 * A system of information begins scattered and tangled. Pressing "Organize"
 * moves the same nodes into a clean hierarchy and swaps the crossing links for
 * an orderly tree — structure emerging from complexity. The visitor sees the
 * value of the exercise (before → action → after) before reading the work below.
 *
 * Driven by the #work section's data-state (scattered | organized), toggled by
 * the shared state-toggle on the Organize control.
 */
export function initIA() {
  const section = document.getElementById("work");
  const nodesEl = document.getElementById("ia-nodes");
  const linksEl = document.getElementById("ia-links");
  if (!section || !nodesEl || !linksEl) return;

  const N = 10;
  const scattered = [
    [12, 22], [35, 9], [59, 17], [82, 12], [21, 55],
    [46, 38], [69, 60], [89, 46], [30, 84], [61, 78],
  ];
  const organized = [
    [50, 12], [25, 42], [50, 42], [75, 42],
    [12, 76], [29, 76], [46, 76], [62, 76], [78, 76], [92, 76],
  ];
  const sizes = [18, 13, 13, 13, 9, 9, 9, 9, 9, 9];
  const orgLinks = [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [2, 6], [2, 7], [3, 8], [3, 9]];
  const scaLinks = [[0, 5], [1, 6], [2, 8], [3, 4], [5, 9], [6, 0], [7, 2], [8, 1], [4, 7], [9, 3]];

  const NS = "http://www.w3.org/2000/svg";
  linksEl.setAttribute("viewBox", "0 0 100 100");
  const drawLines = (pairs, cls, coords) =>
    pairs.forEach(([a, b]) => {
      const l = document.createElementNS(NS, "line");
      l.setAttribute("x1", coords[a][0]); l.setAttribute("y1", coords[a][1]);
      l.setAttribute("x2", coords[b][0]); l.setAttribute("y2", coords[b][1]);
      l.setAttribute("class", cls);
      linksEl.appendChild(l);
    });
  drawLines(scaLinks, "ia-link ia-link--scattered", scattered);
  drawLines(orgLinks, "ia-link ia-link--organized", organized);

  const nodes = [];
  for (let i = 0; i < N; i++) {
    const d = document.createElement("span");
    d.className = "ia-node";
    if (i === 0) d.classList.add("ia-node--root");
    d.style.setProperty("--s", `${sizes[i]}px`);
    nodesEl.appendChild(d);
    nodes.push(d);
  }

  const apply = (state) => {
    const coords = state === "organized" ? organized : scattered;
    nodes.forEach((n, i) => {
      n.style.left = `${coords[i][0]}%`;
      n.style.top = `${coords[i][1]}%`;
    });
  };
  apply(section.getAttribute("data-state") || "scattered");

  new MutationObserver(() => apply(section.getAttribute("data-state"))).observe(section, {
    attributes: true,
    attributeFilter: ["data-state"],
  });
}
