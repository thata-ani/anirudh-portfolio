/**
 * ATTENTION & HAPTICS — make every action feel tactile and every CTA obvious.
 *
 *  1. A haptic tick on EVERY interactive click (buttons, CTAs, chips, links)
 *     so taps feel like a real product responding.
 *  2. When a primary CTA scrolls into its section it "vibrates" (a short shake)
 *     so viewers immediately understand it is clickable.
 *
 * Both are progressive enhancement: no vibration hardware just means no buzz;
 * reduced-motion users get no shake. Purely additive to existing interactions.
 */
import { haptic } from "./sound.js";

/* Any control that should buzz when clicked. */
const CLICKABLE =
  "button, a.btn, .site-nav__cta, .ia-cta, .rules__click, .ecosystem__core, " +
  ".appreciate__btn, .vibe__toggle, .vibe__chip, .sketch__tool, .sketch__ink, " +
  ".sketch__clear, .intro__btn, [role='button']";

/* Primary CTAs that should shake when they enter their section. The testimonials
   core is intentionally excluded — it already has its own inviting pulse. */
const CTA_SELECTORS = [
  ".intro__btn",
  ".hero__actions .btn",
  ".ia-cta",
  ".rules__click",
  "#contact-cta",
  ".appreciate__btn",
];

export function initAttention() {
  // 1) Haptic on every interactive click.
  document.addEventListener(
    "click",
    (e) => {
      const el = e.target.closest(CLICKABLE);
      if (el && !el.hasAttribute("aria-disabled")) haptic(9);
    },
    { passive: true }
  );

  // 2) Shake CTAs as they enter view.
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;

  const els = [];
  CTA_SELECTORS.forEach((sel) =>
    document.querySelectorAll(sel).forEach((el) => els.push(el))
  );
  if (!els.length) return;

  const buzz = (el) => {
    el.classList.remove("is-attn");
    void el.offsetWidth; // reflow so the animation restarts every time
    el.classList.add("is-attn");
    window.setTimeout(() => el.classList.remove("is-attn"), 900);
  };

  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => { if (en.isIntersecting) buzz(en.target); }),
    { threshold: 0.6 }
  );
  els.forEach((el) => io.observe(el));
}
