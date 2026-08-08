/**
 * Entry point.
 *
 * The page is fully readable without JS (progressive enhancement). JS adds the
 * continuous light and the five principle-interactions that let a visitor feel
 * each principle before reading about it:
 *
 *   Hero            → Accessibility
 *   Selected Work   → Information Architecture
 *   Framework       → Clarity
 *   Recommendations → Collaboration
 *   Contact         → Connection
 */
import { initHero } from "./modules/hero.js";
import { initNav } from "./modules/nav.js";
import { initReveal } from "./modules/reveal.js";
import { initLightField } from "./modules/lightfield.js";
import { initTeam } from "./modules/team.js";
import { initContact } from "./modules/contact.js";
import { createStateToggle } from "./modules/state-toggle.js";

const boot = () => {
  initLightField();
  initHero();
  initNav();
  initReveal();
  initTeam();
  initContact();

  // Selected Product Work — Information Architecture: initiatives scatter → organize.
  const workBtn = document.getElementById("work-organize");
  createStateToggle({
    button: workBtn,
    target: workBtn ? workBtn.closest(".case") : null,
    offState: "scattered",
    onState: "organized",
  });

  // Decision-Making Framework — Clarity: complex → clear.
  createStateToggle({
    button: document.getElementById("framework-simplify"),
    target: document.getElementById("framework"),
    offState: "complex",
    onState: "clear",
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
