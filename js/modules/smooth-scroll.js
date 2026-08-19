/**
 * SMOOTH SCROLL — experimental, Lenis-driven inertial scroll.
 *
 * Replaces the browser's native `scroll-behavior: smooth` (css/base.css) as
 * the page's scroll engine, and gives ScrollTrigger one continuously-updated
 * source of truth for scroll position instead of reading native scroll
 * events, which fire coarsely and don't describe the easing in between.
 *
 * Never active under reduced motion, or if the vendor script failed to load
 * — everything in the codebase that calls scrollTo/scrollIntoView already
 * has a native fallback, so the page is never left without a way to move.
 *
 * Not gated behind a flag like pin.js: this is meant to become the page's
 * one scroll engine if kept, not a permanent opt-in layered on top of
 * another one.
 */

let lenis = null;

export function initSmoothScroll(gsap, ScrollTrigger) {
  if (lenis) return lenis; // idempotent — case.js and main.js never both run,
                            // but a hot-reload or double boot must not double-init
  if (!window.Lenis || !gsap || !ScrollTrigger) return null;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  lenis = new window.Lenis({
    duration: 1.1,
    // Lenis's own documented expo-out default — kept rather than hand-matching
    // the site's --ease-out cubic-bezier, since that token is tuned for short
    // UI transitions (a few hundred ms), not a scroll that can run for seconds
    // on a long case study; the two aren't the same kind of easing problem.
    easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    // Touch scroll is left native (this is Lenis's own default — syncTouch is
    // not enabled): iOS/Android already have good scroll inertia, and
    // virtualizing it on top tends to read as laggier, not smoother.
  });

  document.documentElement.setAttribute("data-smooth", "on");

  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on("scroll", ScrollTrigger.update);

  // In-page anchors (#work, #contact, ...) used to get their ease from the
  // native scroll-behavior this replaces — route them through Lenis instead
  // of letting the browser jump the hash on its own.
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.hash.length < 2) return;
    const target = document.querySelector(a.hash);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target);
  });

  return lenis;
}

/** The live instance, or null if smooth scroll never started. Any module that
 *  moves the page programmatically should prefer this over window.scrollTo —
 *  a raw native jump while Lenis is mid-animation gets contested a frame
 *  later, once Lenis's own loop resumes from its last known target. */
export function getLenis() {
  return lenis;
}
