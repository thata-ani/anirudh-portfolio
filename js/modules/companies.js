/**
 * COMPANIES I'VE BUILT WITH — a career trajectory running through the page.
 *
 * A single straight line runs the full width of the section. Company names
 * travel along it toward one central point, at a uniform size throughout —
 * only colour/weight mark which one is passing through "now", never a size
 * change. The line is solid up to that point and faint ahead of it: many
 * organizations accumulating into one evolving designer.
 *
 * Horizontal travel is CSS (a seamless loop); this module only reads each
 * name's distance from the centre each frame and shapes its emphasis.
 */
import { prefersReducedMotion } from "./env.js";

const COMPANIES = [
  "Syngenta", "PwC", "Deloitte", "Innovapptive", "Xtream IT Solutions", "UI Solutions",
];

export function initCompanies() {
  const track = document.getElementById("marquee-track");
  const stage = track ? track.closest(".trajectory") : null;
  if (!track || !stage) return;

  const make = (hidden) =>
    COMPANIES.forEach((name) => {
      const el = document.createElement("span");
      el.className = "traj-item";
      el.textContent = name;
      if (hidden) el.setAttribute("aria-hidden", "true");
      track.appendChild(el);
    });
  make(false);
  make(true);

  if (prefersReducedMotion()) return; // static, evenly spaced — no focal motion

  const items = [...track.children];
  const tick = () => {
    const r = stage.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const half = r.width / 2 || 1;
    for (const it of items) {
      const b = it.getBoundingClientRect();
      const ic = b.left + b.width / 2;
      let k = 1 - Math.abs(ic - cx) / half; // 1 at centre → 0 at edges
      if (k < 0) k = 0;
      const ek = k * k * (3 - 2 * k); // smoothstep → a settled "arrival"
      it.style.opacity = (0.26 + ek * 0.74).toFixed(3);
      it.classList.toggle("is-focal", k > 0.9);
      it.classList.toggle("is-near", k > 0.72);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
