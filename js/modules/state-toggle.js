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
 */
export function createStateToggle({ button, target, offState, onState }) {
  if (!button || !target) return;

  const apply = (isOn) => {
    target.setAttribute("data-state", isOn ? onState : offState);
    button.setAttribute("aria-pressed", String(isOn));
  };

  button.addEventListener("click", () => {
    apply(button.getAttribute("aria-pressed") !== "true");
  });

  apply(false);
}
