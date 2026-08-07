/**
 * COMPANIES — continuous marquee.
 * Company names are rendered from data and duplicated once so the CSS
 * translateX(-50%) loop is seamless. Only names — no cards, no descriptions.
 */
const COMPANIES = [
  "Northwind",
  "Meridian",
  "Atlas",
  "Vantage",
  "Foundry",
  "Beacon",
  "Coreline",
  "Praxis",
  "Lattice",
  "Halcyon",
];

export function initMarquee() {
  const track = document.getElementById("marquee-track");
  if (!track) return;

  const build = () =>
    COMPANIES.map((name) => {
      const el = document.createElement("span");
      el.className = "marquee__item";
      el.textContent = name;
      return el;
    });

  // Two passes for a seamless -50% loop.
  build().forEach((el) => track.appendChild(el));
  build().forEach((el) => {
    el.setAttribute("aria-hidden", "true");
    track.appendChild(el);
  });
}
