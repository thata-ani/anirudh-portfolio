/**
 * TESTIMONIALS — Principle: Collaboration.
 *
 * Two illustrations of the same Tower Bridge: open (disciplines queued on
 * either bank, nothing can cross) and connected (all six moving together,
 * communication flowing across the span). Pressing "Bring them together"
 * cross-fades from one to the other — the story is in the images
 * themselves, not a hand-built diagram.
 */
import { prefersReducedMotion } from "./env.js";

export function initTeam() {
  const section = document.getElementById("testimonials");
  const eco = document.getElementById("team");
  const button = document.getElementById("testimonials-connect");
  if (!section || !eco || !button) return;

  const quotes = section.querySelector(".quotes");
  const aha = document.getElementById("team-aha");
  const reduce = prefersReducedMotion();

  const connect = (on) => {
    eco.setAttribute("data-connected", String(on));
    section.setAttribute("data-state", on ? "connected" : "disconnected");
    button.setAttribute("aria-pressed", String(on));
    if (aha && on) {
      aha.textContent =
        "Research, Business, Domain expertise, Design, Product and Engineering — six disciplines moving as one. The product doesn't wait at the gap; it crosses.";
    }
    // Quotes are display:none until connected — they reserve no layout space
    // while the visitor hasn't earned them yet. Once `display: grid` has
    // actually been painted (double rAF), add the class that fades them in;
    // triggering the fade in the same tick as the display change wouldn't
    // transition at all.
    if (quotes) {
      quotes.classList.remove("is-in");
      if (on) requestAnimationFrame(() => requestAnimationFrame(() => quotes.classList.add("is-in")));
    }
  };
  button.addEventListener("click", () => connect(button.getAttribute("aria-pressed") !== "true"));
  connect(reduce); // reduced motion → start connected & readable; otherwise open
}
