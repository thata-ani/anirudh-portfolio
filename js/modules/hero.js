/**
 * HERO — Principle: Accessibility.
 *
 * The portfolio begins almost inaccessible: only the architectural light seed
 * is visible. Pressing the switch turns the light on; it expands and, staggered
 * like light spreading, reveals nav → name → headline → copy → buttons.
 *
 * The reveal itself is CSS-driven (html[data-reveal="on"]). This module only
 * flips that state and manages the switch's ARIA + focus hand-off.
 */
export function initHero() {
  const root = document.documentElement;
  const switchBtn = document.getElementById("hero-switch");
  if (!switchBtn) return;

  const setLit = (lit) => {
    root.setAttribute("data-reveal", lit ? "on" : "off");
    switchBtn.setAttribute("aria-checked", String(lit));
  };

  const reveal = () => {
    if (root.getAttribute("data-reveal") === "on") return;
    setLit(true);

    // Move focus to the now-available heading so keyboard/AT users land on the
    // content the light just revealed — accessibility made real, not decorative.
    const title = document.getElementById("hero-title");
    if (title) {
      title.setAttribute("tabindex", "-1");
      // Wait for the reveal transition to begin so focus doesn't fight the paint.
      window.setTimeout(() => title.focus({ preventScroll: true }), 420);
    }
  };

  switchBtn.addEventListener("click", () => {
    const isOn = root.getAttribute("data-reveal") === "on";
    isOn ? setLit(false) : reveal();
  });

  // Ensure the deterministic starting state regardless of any cached attribute.
  setLit(false);
}
