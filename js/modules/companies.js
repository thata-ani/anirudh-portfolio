/**
 * COMPANIES I'VE BUILT WITH — a career trajectory running through the page.
 *
 * A single continuous path travels the full width of the section. Company
 * names ride that path and move toward a central focal point. As each name
 * approaches, arrives at, and passes the focal axis it grows, settles at the
 * crossing (where the path meets its centre line), highlights, then recedes
 * and continues — approach → arrival → highlight → continuation. Many
 * organizations passing through one point: experience accumulating into one
 * evolving designer.
 *
 * The horizontal travel is CSS (a seamless loop); this module draws the path
 * and, each frame, lifts every name onto the curve and shapes its emphasis by
 * distance from the focal axis.
 */
import { prefersReducedMotion } from "./env.js";

const COMPANIES = [
  "Syngenta", "PwC", "Deloitte", "Innovapptive", "Xtream IT Solutions", "UI Solutions",
];

export function initCompanies() {
  const track = document.getElementById("marquee-track");
  const stage = track ? track.closest(".trajectory") : null;
  if (!track || !stage) return;
  const svg = document.getElementById("trajectory-path");
  const lineEl = document.getElementById("traj-line");
  const litEl = document.getElementById("traj-lit");

  const make = (hidden) =>
    COMPANIES.forEach((name) => {
      const el = document.createElement("span");
      el.className = "traj-item";
      const dot = document.createElement("span");
      dot.className = "traj-item__dot";
      dot.setAttribute("aria-hidden", "true");
      el.appendChild(dot);
      el.appendChild(document.createTextNode(name));
      if (hidden) el.setAttribute("aria-hidden", "true");
      track.appendChild(el);
    });
  make(false);
  make(true);

  // The path: one full wave across the width, crossing its centre line exactly
  // at the focal axis (x = W/2) so an arriving name settles on the crossing.
  let W = 0, H = 0, A = 0;
  const yAt = (x) => A * Math.sin((x / W) * Math.PI * 2); // offset from centre line

  const build = () => {
    const r = stage.getBoundingClientRect();
    W = r.width; H = r.height;
    A = H * 0.22;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const mid = H / 2;
    const sample = (x0, x1) => {
      let d = "";
      for (let x = x0; x <= x1; x += 8) {
        d += (d ? " L" : "M") + x.toFixed(1) + "," + (mid + yAt(x)).toFixed(1);
      }
      return d;
    };
    lineEl.setAttribute("d", sample(0, W));
    litEl.setAttribute("d", sample(0, W / 2)); // accumulated experience up to "now"
  };
  build();
  window.addEventListener("resize", build, { passive: true });

  if (prefersReducedMotion()) return; // static, evenly spaced — no focal motion

  const items = [...track.children];
  const tick = () => {
    const r = stage.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const half = r.width / 2 || 1;
    for (const it of items) {
      const b = it.getBoundingClientRect();
      const ic = b.left + b.width / 2;
      const xLocal = ic - r.left;
      const y = yAt(xLocal);
      let k = 1 - Math.abs(ic - cx) / half; // 1 at focal → 0 at edges
      if (k < 0) k = 0;
      const ek = k * k * (3 - 2 * k); // smoothstep → a settled "arrival"
      const scale = 0.8 + ek * 0.78;
      it.style.transform = `translateY(${y.toFixed(1)}px) scale(${scale.toFixed(3)})`;
      it.style.opacity = (0.2 + ek * 0.8).toFixed(3);
      it.classList.toggle("is-focal", k > 0.9);
      it.classList.toggle("is-near", k > 0.72);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
