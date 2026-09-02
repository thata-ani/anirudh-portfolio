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

/* Triggers are measured against the layout as it stands when they are created.
   On a page carrying real photographs that layout is not final yet: every image
   that settles afterwards moves everything below it, and a trigger whose start
   was recorded against the old positions can be left somewhere the scroll never
   reaches — so the element it guards never gets revealed. Re-measure as the
   images land, coalesced so a page of them costs one refresh. */
function refreshOnImages() {
  const pending = [...document.images].filter((img) => !img.complete);
  if (!pending.length) return;
  let t;
  const settle = () => {
    clearTimeout(t);
    t = setTimeout(() => window.ScrollTrigger.refresh(), 200);
  };
  pending.forEach((img) => {
    img.addEventListener("load", settle, { once: true });
    img.addEventListener("error", settle, { once: true });
  });
}

/* ---- Intro — the lamp arrives, then the room settles ---------------------- */
/* Always safe to call: without GSAP (or with reduced motion) it simply marks
   the intro ready and everything stays visible. GSAP only ever adds the
   arrival, then clears its inline styles so CSS owns the turn-on and exit. */
export function initIntroMotion() {
  const intro = document.getElementById("intro");
  if (!intro) return false;
  // The intro was skipped for this visit — there is no arrival to choreograph.
  if (document.documentElement.classList.contains("skip-intro")) return false;
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
  refreshOnImages();
  return true;
}

/* ---- A hero that arrives in order ----------------------------------------
   One entrance, played once, on load. The order is authored in the markup as
   `data-hero-seq` rather than inferred from position, so the sequence is
   readable where the content is. Each step moves a short distance and the
   title also settles from 0.96 — enough to feel deliberate, not enough to
   read as an effect. Returns the elements it owns so they are not also
   picked up by the scroll reveal. */
function heroSequence(gsap, reduce) {
  const steps = [...document.querySelectorAll("[data-hero-seq]")].sort(
    (a, b) => a.dataset.heroSeq - b.dataset.heroSeq
  );
  if (!steps.length) return [];
  if (reduce) {
    gsap.set(steps, { autoAlpha: 1, y: 0, scale: 1 });
    return steps;
  }

  const tl = gsap.timeline({ delay: 0.15 });
  steps.forEach((el, i) => {
    const isTitle = el.matches("h1");
    gsap.set(el, { autoAlpha: 0, y: isTitle ? 22 : 12, scale: isTitle ? 0.965 : 1 });
    tl.to(
      el,
      {
        autoAlpha: 1, y: 0, scale: 1,
        duration: isTitle ? 1.15 : 0.85,
        ease: isTitle ? EASE_DISPLAY : EASE,
        // The title clears its own transform so nothing is left on it for the
        // scroll departure below to fight with.
        clearProps: isTitle ? "scale" : "",
      },
      i === 0 ? 0 : `-=${isTitle ? 0.55 : 0.62}`
    );
  });
  return steps;
}

/* The hero doesn't cut to the next section — it recedes as it leaves, so the
   page reads as one continuous piece rather than a stack of screens. Scrubbed
   against the hero's own exit, and deliberately small. */
function heroDeparture(gsap, reduce) {
  const hero = document.querySelector(".db-hero");
  if (!hero || reduce) return;
  gsap.to(hero, {
    autoAlpha: 0.28,
    y: -40,
    ease: "none",
    scrollTrigger: { trigger: hero, start: "bottom 88%", end: "bottom top", scrub: 0.5 },
  });
}

/* ---- Case studies (designbesti / cropwise) ------------------------------- */
export function initCaseMotion() {
  const gsap = setup();
  if (!gsap) return false;
  const reduce = prefersReducedMotion();

  const owned = new Set(heroSequence(gsap, reduce));
  heroDeparture(gsap, reduce);

  const displayEls = [
    ...document.querySelectorAll("h1, .db-h2"),
  ].filter((el) => el.textContent.trim().length > 0 && !owned.has(el));
  const splitOK = headlineReveal(gsap, displayEls);
  const excluded = new Set(splitOK ? displayEls : []);

  const items = gsap.utils
    .toArray(".db-in")
    .filter((el) => !excluded.has(el) && !owned.has(el));
  riseBatch(gsap, items, { y: 20, stagger: 0.07 });

  // Evidence arrives rather than rises: a screen or a photograph that slides
  // reads as a card, and these are meant to read as the thing itself.
  //
  // Hiding the evidence to animate it is how it stayed invisible for a whole
  // afternoon earlier in this project, so it is hidden only once GSAP is
  // confirmed running, and a watchdog puts anything the scroll never reached
  // back on screen. An unanimated screenshot is a small loss; a missing one is
  // the case study failing.
  // The strip is revealed as one band, not photo by photo: it duplicates its
  // own children for the seamless loop, and cloneNode copies inline style — so
  // per-item tweening leaves every clone stuck at the hidden start state.
  const evidence = gsap.utils.toArray(".cw2-shot, .cw2-strip");
  if (evidence.length && !reduce) {
    gsap.set(evidence, { autoAlpha: 0, scale: 0.985 });
    window.ScrollTrigger.batch(evidence, {
      start: "top 92%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          autoAlpha: 1, scale: 1,
          duration: 1.1, ease: EASE, stagger: 0.09,
          clearProps: "transform",
        }),
    });
    setTimeout(() => {
      evidence.forEach((el) => {
        const seen = el.getBoundingClientRect().top < window.innerHeight;
        if (seen && getComputedStyle(el).visibility === "hidden") {
          gsap.set(el, { autoAlpha: 1, scale: 1, clearProps: "transform" });
        }
      });
    }, 4000);
  }

  refreshOnInteraction();
  refreshOnImages();
  return true;
}
