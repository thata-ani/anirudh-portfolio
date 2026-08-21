/**
 * A reusable "press to experience the principle" toggle.
 *
 * Powers:
 *   · Selected Work   — scattered  ⇄ organized   (Information Architecture)
 *   · Principles      — complex    ⇄ clear        (Clarity)
 *
 * The button carries aria-pressed; the target section carries data-state.
 * The transformation lives entirely in CSS — this only flips state + ARIA,
 * so it stays replayable and honours reduced-motion automatically.
 *
 * persistKey (optional): remembers an "on" choice in sessionStorage, so
 * following a case-study link out and using the back-to-portfolio nav
 * doesn't undo it — a fresh tab/session still starts from the off state.
 */
import { haptic } from "./sound.js";

export function createStateToggle({ button, target, offState, onState, persistKey }) {
  if (!button || !target) return;

  const apply = (isOn) => {
    target.setAttribute("data-state", isOn ? onState : offState);
    button.setAttribute("aria-pressed", String(isOn));
    if (persistKey) {
      try { sessionStorage.setItem(persistKey, isOn ? "1" : "0"); } catch { /* private mode */ }
    }
  };

  button.addEventListener("click", () => {
    haptic(10);
    apply(button.getAttribute("aria-pressed") !== "true");
  });

  let initial = false;
  if (persistKey) {
    try { initial = sessionStorage.getItem(persistKey) === "1"; } catch { /* private mode */ }
  }
  apply(initial);
}
