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
import { initLightField } from "./modules/lightfield.js";
import { initCompanies } from "./modules/companies.js";
import { initIA } from "./modules/ia.js";
import { initTeam } from "./modules/team.js";
import { initContact } from "./modules/contact.js";
import { initExplore } from "./modules/explore.js";
import { initHeroGraphic } from "./modules/herographic.js";
import { initMusic } from "./modules/music.js";
import { initRules } from "./modules/rules.js";
import { initSketch } from "./modules/sketch.js";
import { createStateToggle } from "./modules/state-toggle.js";

const boot = () => {
  initLightField();
  initHero();
  initNav();
  initReveal();
  initCompanies();
  initIA();
  initTeam();
  initContact();
  initExplore();
  initHeroGraphic();
  initMusic();
  initRules();
  initSketch();

  // Selected Work — Information Architecture: scattered → organized.
  createStateToggle({
    button: document.getElementById("work-organize"),
    target: document.getElementById("work"),
    offState: "scattered",
    onState: "organized",
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
