/**
 * THE CONTINUOUS LIGHT FIELD
 *
 * One warm light travels the whole page so the experience reads as a single lit
 * space rather than stacked sections:
 *   · Y position tracks scroll progress (the light descends as you read).
 *   · X position + size ease toward each section's data-lx / data-lsize target.
 *   · Intensity ramps up when the hero light is switched on (Accessibility).
 *   · A light parallax on the hero planes adds depth.
 *
 * All writes go to the #lightfield element's custom properties; --lx/--lsize/
 * --lint are @property-registered so they transition smoothly, while --ly is
 * written every frame (no transition) to stay glued to scroll.
 */
import { prefersReducedMotion } from "./env.js";

export function initLightField() {
  const field = document.getElementById("lightfield");
  if (!field) return;

  const html = document.documentElement;

  // Intensity follows the hero switch in every mode.
  const applyIntensity = () => {
    field.style.setProperty(
      "--lint",
      html.getAttribute("data-reveal") === "on" ? "0.95" : "0.18"
    );
  };
  new MutationObserver(applyIntensity).observe(html, {
    attributes: true,
    attributeFilter: ["data-reveal"],
  });
  applyIntensity();

  // Reduced motion: fix the light, skip scroll tracking + parallax entirely.
  if (prefersReducedMotion()) {
    field.style.setProperty("--ly", "40%");
    return;
  }

  const planes = document.querySelector(".hero__planes");
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = html.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      field.style.setProperty("--ly", (8 + p * 82).toFixed(2) + "%");
      if (planes) planes.style.setProperty("--pY", (window.scrollY * -0.04).toFixed(1) + "px");
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Per-section X + size targets ease via the @property transitions on #lightfield.
  const targets = [...document.querySelectorAll("[data-lx], [data-lsize]")];
  if ("IntersectionObserver" in window && targets.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const lx = entry.target.getAttribute("data-lx");
          const lsize = entry.target.getAttribute("data-lsize");
          if (lx) field.style.setProperty("--lx", lx);
          if (lsize) field.style.setProperty("--lsize", lsize);
        });
      },
      { threshold: 0.5, rootMargin: "-15% 0px -35% 0px" }
    );
    targets.forEach((t) => io.observe(t));
  }
}
