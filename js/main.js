/**
 * Entry point.
 *
 * Each interaction is a self-contained module that demonstrates one Product
 * Design principle. The page is fully readable without JS (progressive
 * enhancement); JS adds the experiences that let a visitor *feel* the principle
 * before reading about it.
 *
 *   Hero          → Accessibility
 *   Selected Work → Information Architecture
 *   Principles    → Clarity
 *   Testimonials  → Collaboration
 *   Contact       → Connection
 */
import { initHero } from "./modules/hero.js";
import { initNav } from "./modules/nav.js";
import { initReveal } from "./modules/reveal.js";
import { initMarquee } from "./modules/marquee.js";
import { initTeam } from "./modules/team.js";
import { initContact } from "./modules/contact.js";
import { createStateToggle } from "./modules/state-toggle.js";

const boot = () => {
  initHero();
  initNav();
  initReveal();
  initMarquee();
  initTeam();
  initContact();

  // Selected Work — Information Architecture: scattered → organized.
  createStateToggle({
    button: document.getElementById("work-organize"),
    target: document.getElementById("work"),
    offState: "scattered",
    onState: "organized",
  });

  // Principles — Clarity: complex → clear.
  createStateToggle({
    button: document.getElementById("principles-simplify"),
    target: document.getElementById("principles"),
    offState: "complex",
    onState: "clear",
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
