/**
 * COMPANIES — continuous marquee.
 * Real companies, rendered from data and duplicated once for a seamless loop.
 */
const COMPANIES = [
  "Syngenta",
  "PwC",
  "Deloitte",
  "Innovapptive",
  "Xtream IT Solutions",
  "UI Solutions",
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

  build().forEach((el) => track.appendChild(el));
  build().forEach((el) => {
    el.setAttribute("aria-hidden", "true");
    track.appendChild(el);
  });
}
