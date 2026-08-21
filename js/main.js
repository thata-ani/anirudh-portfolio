/**
 * Entry point.
 *
 * The page is fully readable without JS (progressive enhancement). JS adds the
 * continuous light and the five product-principle interactions:
 *
 *   Hero          → Accessibility  (pull the light on)
 *   Selected Work → Information Architecture  (Organize)
 *   Rules         → Meaningful interaction  (click to earn, then click less)
 *   Testimonials  → Collaboration  (Connect)
 *   Contact       → Connection  (arrival tone + haptic)
 */
import { initHero } from "./modules/hero.js";
import { initNav } from "./modules/nav.js";
import { initReveal } from "./modules/reveal.js";
import { initMotion, initIntroMotion } from "./modules/motion.js";
import { initPin } from "./modules/pin.js";
import { initSmoothScroll } from "./modules/smooth-scroll.js";
import { initMagnetic } from "./modules/magnetic.js";
import { initExplain } from "./modules/explain.js";
import { initSkewScroll } from "./modules/skew-scroll.js";
import { initHorizontalRoadmap } from "./modules/horizontal-roadmap.js";
import { initLightField } from "./modules/lightfield.js";
import { initCompanies } from "./modules/companies.js";
import { initTeam } from "./modules/team.js";
import { initContact } from "./modules/contact.js";
import { initExplore } from "./modules/explore.js";
import { initHeroGraphic } from "./modules/herographic.js";
import { initMusic } from "./modules/music.js";
import { initRules } from "./modules/rules.js";
import { initSketch } from "./modules/sketch.js";
import { initAnalytics } from "./modules/analytics.js";
import { initAttention } from "./modules/attention.js";
import { createStateToggle } from "./modules/state-toggle.js";

const boot = () => {
  initSmoothScroll(window.gsap, window.ScrollTrigger);
  initLightField();
  initHero();
  initNav();
  if (!initMotion()) initReveal();
  initIntroMotion();
  initPin(window.gsap, window.ScrollTrigger);
  initMagnetic();
  initExplain();
  initSkewScroll(window.gsap, window.ScrollTrigger);
  initHorizontalRoadmap(window.gsap, window.ScrollTrigger);
  initCompanies();
  initTeam();
  initContact();
  initExplore();
  initHeroGraphic();
  initMusic();
  initRules();
  initSketch();
  initAnalytics();
  initAttention();

  // Selected Work — Information Architecture: scattered → organized.
  createStateToggle({
    button: document.getElementById("work-organize"),
    target: document.getElementById("work"),
    offState: "scattered",
    onState: "organized",
    persistKey: "work_organized",
  });
  // Hovering the CTA previews the transformation, so its effect is obvious
  // before the click (and the preview clears once actually organized).
  const workBtn = document.getElementById("work-organize");
  const workSec = document.getElementById("work");
  if (workBtn && workSec) {
    const preview = (on) => {
      if (on && workSec.getAttribute("data-state") === "scattered") workSec.classList.add("is-previewing");
      else workSec.classList.remove("is-previewing");
    };
    workBtn.addEventListener("pointerenter", () => preview(true));
    workBtn.addEventListener("pointerleave", () => preview(false));
    workBtn.addEventListener("focus", () => preview(true));
    workBtn.addEventListener("blur", () => preview(false));
    workBtn.addEventListener("click", () => preview(false));
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
