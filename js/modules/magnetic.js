/**
 * MAGNETIC BUTTONS — experimental.
 *
 * The primary pill/circular controls pull toward the cursor within a field
 * a little larger than their own box, and spring back once the pointer
 * leaves. Mouse/trackpad only — gated on (hover: hover) and (pointer: fine),
 * never wired for touch, and skipped entirely under reduced motion.
 *
 * Scoped to controls with no other system animating their transform: the
 * intro's "Turn on the light" button is deliberately excluded, since it
 * already runs its own GSAP arrival timeline and a CSS exit choreography —
 * a third system fighting for the same transform would only fight itself.
 *
 * Several targets already had a CSS `:active { transform: scale(...) }`
 * press affordance. An inline transform (which is what quickTo writes) beats
 * that rule outright, so the press feedback is folded into this module's own
 * transform stack instead of left to lose the fight silently.
 */

const SELECTOR = ".site-nav__cta, .hero__actions .btn, .db-top__cta, .db-totop, .proto-fab";
const FIELD = 46;      // px beyond the element's own edge that starts the pull
const STRENGTH = 0.4;
const MAX_PULL = 16;   // px

export function initMagnetic() {
  if (!window.gsap) return null;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return null;

  const els = [...document.querySelectorAll(SELECTOR)];
  if (!els.length) return null;

  const items = els.map((el) => ({
    el,
    toX: gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" }),
    toY: gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" }),
    toScale: gsap.quickTo(el, "scale", { duration: 0.3, ease: "power2.out" }),
    active: false,
  }));

  const release = (it) => {
    it.active = false;
    it.toX(0);
    it.toY(0);
  };

  const onMove = (e) => {
    for (const it of items) {
      const r = it.el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const inField = Math.abs(dx) < r.width / 2 + FIELD && Math.abs(dy) < r.height / 2 + FIELD;
      if (inField) {
        it.active = true;
        it.toX(Math.max(-MAX_PULL, Math.min(MAX_PULL, dx * STRENGTH)));
        it.toY(Math.max(-MAX_PULL, Math.min(MAX_PULL, dy * STRENGTH)));
      } else if (it.active) {
        release(it);
      }
    }
  };
  document.addEventListener("pointermove", onMove, { passive: true });

  // Replaces the CSS :active scale this module's inline transform overrides.
  document.addEventListener("pointerdown", (e) => {
    const it = items.find((i) => i.active && i.el.contains(e.target));
    if (it) it.toScale(0.96);
  });
  document.addEventListener("pointerup", () => {
    items.forEach((it) => it.toScale(1));
  });

  // A control that just navigated should not be left visibly pulled
  // off-centre for whatever fraction of a second the page takes to unload.
  window.addEventListener("pagehide", () => items.forEach(release));

  return items;
}
