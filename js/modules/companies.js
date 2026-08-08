/**
 * COMPANIES I'VE BUILT WITH — a focal trajectory.
 *
 * Company names travel along a central axis; whichever is crossing the focal
 * point (centre) is emphasised — larger, fully present — then recedes as the
 * next arrives. Many experiences passing through one point: an accumulation
 * into one designer. The track motion is CSS; this module only reads each
 * item's distance from centre each frame and shapes its scale/opacity.
 */
import { prefersReducedMotion } from "./env.js";

const COMPANIES = [
  "Syngenta", "PwC", "Deloitte", "Innovapptive", "Xtream IT Solutions", "UI Solutions",
];

export function initCompanies() {
  const track = document.getElementById("marquee-track");
  const marquee = track ? track.closest(".marquee") : null;
  if (!track || !marquee) return;

  const make = (hidden) =>
    COMPANIES.forEach((name) => {
      const el = document.createElement("span");
      el.className = "marquee__item";
      el.textContent = name;
      if (hidden) el.setAttribute("aria-hidden", "true");
      track.appendChild(el);
    });
  make(false);
  make(true);

  if (prefersReducedMotion()) return; // static, evenly spaced — no focal motion

  const items = [...track.children];
  const tick = () => {
    const rect = marquee.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const half = rect.width / 2 || 1;
    for (const it of items) {
      const r = it.getBoundingClientRect();
      const ic = r.left + r.width / 2;
      const k = Math.max(0, 1 - Math.abs(ic - cx) / half); // 1 at centre → 0 at edge
      const scale = 0.82 + k * 0.55;
      it.style.transform = `scale(${scale.toFixed(3)})`;
      it.style.opacity = (0.28 + k * 0.72).toFixed(3);
      it.classList.toggle("is-focal", k > 0.9);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
