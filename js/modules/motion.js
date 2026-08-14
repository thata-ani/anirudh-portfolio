/**
 * GSAP motion system — black & white Modernist motion language.
 *
 * Principles:
 *   · decisive easings (power3/power4 out) — no bounce, no elastic
 *   · masked line reveals on display type (SplitText, lines rise from behind a rule)
 *   · labels wipe in along the reading direction (clip-path)
 *   · short distances, tight staggers — precision over spectacle
 *
 * Falls back to the IntersectionObserver reveal (reveal.js / case.js) when
 * GSAP is absent or the visitor prefers reduced motion. Returns true when
 * GSAP owns the motion.
 */
import { prefersReducedMotion } from "./env.js";

const EASE = "power3.out";
const EASE_DISPLAY = "power4.out";

function setup() {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return null;
  if (prefersReducedMotion()) return null;
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(window.SplitText);
  document.documentElement.classList.add("gsap");
  return gsap;
}

/* Masked line reveal for display type. Lines rise from behind their own
   baseline — the classic editorial move. */
function headlineReveal(gsap, elements) {
  const SplitText = window.SplitText;
  if (!SplitText) return false;
  document.fonts.ready.then(() => {
    elements.forEach((el) => {
      if (!el || !el.isConnected) return;
      el.removeAttribute("data-anim");
      el.classList.remove("db-in");
      let split;
      try {
        split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "motion-line" });
      } catch {
        gsap.set(el, { clearProps: "all", autoAlpha: 1 });
        return;
      }
      gsap.set(el, { autoAlpha: 1 });
      gsap.from(split.lines, {
        yPercent: 110,
        duration: 1.05,
        ease: EASE_DISPLAY,
        stagger: 0.09,
        scrollTrigger: { trigger: el, start: "top 84%", once: true },
        // Restore the original markup once settled — line masks would
        // otherwise clip inline borders (the underlined em) and descenders.
        onComplete: () => {
          split.revert();
          gsap.set(el, { clearProps: "opacity,visibility" });
        },
      });
    });
    window.ScrollTrigger.refresh();
  });
  return true;
}

/* Small mono labels wipe in left→right. */
function labelReveal(gsap, selector) {
  gsap.utils.toArray(selector).forEach((label) => {
    gsap.from(label, {
      clipPath: "inset(0 100% 0 0)",
      autoAlpha: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: { trigger: label, start: "top 88%", once: true },
      clearProps: "clipPath",
    });
  });
}

/* Batched rise — content settles up into place, staggered per viewport batch. */
function riseBatch(gsap, elements, { y = 24, stagger = 0.08 } = {}) {
  if (!elements.length) return;
  elements.forEach((el) => el.classList.add("is-visible", "is-in"));
  gsap.set(elements, { autoAlpha: 0, y });
  window.ScrollTrigger.batch(elements, {
    start: "top 87%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: EASE,
        stagger,
        overwrite: true,
        clearProps: "transform",
      }),
  });
}

/* Opacity-only entrance for elements whose transform belongs to other systems
   (e.g. the scattered/organized work items driven by CSS vars). */
function fadeBatch(gsap, elements, { stagger = 0.12 } = {}) {
  if (!elements.length) return;
  gsap.set(elements, { autoAlpha: 0 });
  window.ScrollTrigger.batch(elements, {
    start: "top 90%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1,
        duration: 1,
        ease: "power2.out",
        stagger,
        clearProps: "opacity,visibility",
      }),
  });
}

/* Layout height changes (explore toggles, deep-dive expands) shift trigger
   positions; refresh shortly after any interactive click. */
function refreshOnInteraction() {
  let t;
  document.addEventListener("click", (e) => {
    if (!e.target.closest("button, [role='button'], summary")) return;
    clearTimeout(t);
    t = setTimeout(() => window.ScrollTrigger.refresh(), 260);
  });
}

/* ---- Intro — the lamp arrives, then the room settles ---------------------- */
/* Always safe to call: without GSAP (or with reduced motion) it simply marks
   the intro ready and everything stays visible. GSAP only ever adds the
   arrival, then clears its inline styles so CSS owns the turn-on and exit. */
export function initIntroMotion() {
  const intro = document.getElementById("intro");
  if (!intro) return false;
  const ready = () => intro.classList.add("is-ready");

  const gsap = setup();
  const lamp = intro.querySelector(".intro__lamp");
  const wire = intro.querySelector(".intro__wire");
  const bulb = intro.querySelector(".intro__bulb");
  const title = intro.querySelector(".intro__title");
  const sub = intro.querySelector(".intro__sub");
  const btn = intro.querySelector(".intro__btn");
  if (!gsap || !lamp || !wire || !bulb) {
    ready();
    return false;
  }

  // Start state is set synchronously, so the arrival never flashes unstyled.
  gsap.set(wire, { transformOrigin: "50% 0%", scaleY: 0 });
  gsap.set(bulb, { autoAlpha: 0, scale: 0.82, transformOrigin: "50% 0%" });
  gsap.set([title, sub].filter(Boolean), { autoAlpha: 0, y: 16 });
  // Opacity (not autoAlpha) on the button — it stays hittable while arriving.
  if (btn) gsap.set(btn, { opacity: 0, y: 12 });

  const tl = gsap.timeline({
    onComplete: () => {
      // The lamp must be cleared too — a leftover inline `translate: none`
      // would cancel the CSS centring the moment the sway keyframes take over.
      gsap.set([lamp, wire, bulb, title, sub, btn].filter(Boolean), { clearProps: "all" });
      ready();
    },
  });

  tl.to(wire, { scaleY: 1, duration: 0.72, ease: EASE })
    .to(bulb, { autoAlpha: 1, scale: 1, duration: 0.6, ease: EASE }, 0.34)
    // A short damped swing — the lamp comes to rest, no bounce.
    .fromTo(lamp, { rotate: -2.6 }, { rotate: 0.9, duration: 0.62, ease: "power2.inOut" }, 0.42)
    .to(lamp, { rotate: 0, duration: 0.9, ease: "power2.inOut" }, 1.04)
    .to(title, { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE_DISPLAY }, 0.62)
    .to(sub, { autoAlpha: 1, y: 0, duration: 0.8, ease: EASE }, 0.86)
    .to(btn, { opacity: 1, y: 0, duration: 0.7, ease: EASE }, 1.04);

  // Turning the light on mid-arrival must never strand a half-played state.
  new MutationObserver((_, obs) => {
    if (document.documentElement.getAttribute("data-reveal") === "on") {
      tl.progress(1);
      obs.disconnect();
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-reveal"] });

  return true;
}

/* ---- Homepage ------------------------------------------------------------ */
export function initMotion() {
  const gsap = setup();
  if (!gsap) return false;

  const displayEls = [
    document.querySelector(".believe__statement"),
    document.getElementById("contact-title"),
  ].filter(Boolean);
  const splitOK = headlineReveal(gsap, displayEls);
  const excluded = new Set(splitOK ? displayEls : []);

  labelReveal(gsap, ".section__label");

  const rises = gsap.utils
    .toArray('[data-anim="rise"], [data-anim="unveil"], [data-anim="draw"]')
    .filter((el) => !excluded.has(el));
  riseBatch(gsap, rises);

  fadeBatch(gsap, gsap.utils.toArray(".work-item"));

  // Subtle counter-drift on the two big statements — restraint, not spectacle.
  displayEls.forEach((el) => {
    gsap.fromTo(
      el,
      { y: 18 },
      {
        y: -18,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 },
      }
    );
  });

  // The intro unlocks scrolling and changes layout — re-measure once revealed.
  new MutationObserver((_, obs) => {
    if (document.documentElement.getAttribute("data-reveal") === "on") {
      window.ScrollTrigger.refresh();
      obs.disconnect();
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-reveal"] });

  refreshOnInteraction();
  return true;
}

/* ---- Case studies (designbesti / cropwise) ------------------------------- */
export function initCaseMotion() {
  const gsap = setup();
  if (!gsap) return false;

  const displayEls = [
    ...document.querySelectorAll("h1, .db-h2"),
  ].filter((el) => el.textContent.trim().length > 0);
  const splitOK = headlineReveal(gsap, displayEls);
  const excluded = new Set(splitOK ? displayEls : []);

  const items = gsap.utils.toArray(".db-in").filter((el) => !excluded.has(el));
  riseBatch(gsap, items, { y: 20, stagger: 0.07 });

  refreshOnInteraction();
  return true;
}
