/**
 * HERO — Principle: Accessibility.
 *
 * The portfolio begins almost inaccessible: only the architectural light seed
 * is visible. Pressing the switch turns the light on; it expands and, staggered
 * like light spreading, reveals nav → name → headline → copy → buttons.
 *
 * The reveal itself is CSS-driven (html[data-reveal="on"]). This module flips
 * that state, sounds the product "powering on", and hands off focus. The reveal
 * is the first product-design lesson: what can't be seen doesn't exist.
 */
import { playCue, haptic } from "./sound.js";

export function initHero() {
  const root = document.documentElement;
  const switchBtn = document.getElementById("hero-switch");
  if (!switchBtn) return;

  // Don't let the browser restore a previous scroll position behind the intro
  // overlay — the experience must always begin at the hero, not wherever the
  // page was last left (which looked like it "landed on the last section").
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  // Lock scrolling while the intro is up so the page can't drift off the hero.
  document.body.style.overflow = "hidden";

  const setLit = (lit) => {
    root.setAttribute("data-reveal", lit ? "on" : "off");
    switchBtn.setAttribute("aria-pressed", String(lit));
  };

  const reveal = () => {
    if (root.getAttribute("data-reveal") === "on") return;
    setLit(true);

    // Begin at the hero and release the scroll lock.
    document.body.style.overflow = "";
    window.scrollTo(0, 0);

    // The product comes alive: action → system response.
    playCue("on");
    haptic(14);

    // Move focus to the now-available heading so keyboard/AT users land on the
    // content the light just revealed — accessibility made real, not decorative.
    const title = document.getElementById("hero-title");
    if (title) {
      title.setAttribute("tabindex", "-1");
      // Wait for the reveal transition to begin so focus doesn't fight the paint.
      window.setTimeout(() => { window.scrollTo(0, 0); title.focus({ preventScroll: true }); }, 420);
    }
  };

  switchBtn.addEventListener("click", () => {
    const isOn = root.getAttribute("data-reveal") === "on";
    isOn ? setLit(false) : reveal();
  });

  // Ensure the deterministic starting state regardless of any cached attribute.
  setLit(false);
}
