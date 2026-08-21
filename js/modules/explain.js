/**
 * EXPLAIN ON HOVER — a product-design habit, not a decoration.
 *
 * A good call-to-action tells you what happens before you commit to it, not
 * just what it's named. Any element carrying data-explain gets a short
 * floating note above it on hover — and on keyboard focus too, so the
 * explanation isn't a mouse-only affordance. A brief delay on hover (not on
 * focus) keeps it from flashing at everyone just passing through.
 *
 * Mouse/trackpad only — gated on (hover: hover) and (pointer: fine), same as
 * the other pointer-only modules on this site. This isn't just "no tooltip
 * on touch": a pointerenter listener left attached on a touch device makes
 * iOS Safari treat the first tap on that element as entering :hover rather
 * than as a click, so the control silently needs a second tap to fire —
 * exactly the target this is meant to explain.
 */

const HOVER_DELAY = 380;

export function initExplain() {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return null;
  const els = [...document.querySelectorAll("[data-explain]")];
  if (!els.length) return null;

  const tip = document.createElement("div");
  tip.className = "explain-tip";
  tip.setAttribute("role", "tooltip");
  tip.setAttribute("aria-hidden", "true");
  document.body.appendChild(tip);

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let current = null;
  let showTimer = null;

  const place = (el) => {
    const r = el.getBoundingClientRect();
    tip.style.top = `${r.top - 10}px`;
    tip.style.left = `${r.left + r.width / 2}px`;
  };

  const show = (el, immediate) => {
    clearTimeout(showTimer);
    const run = () => {
      current = el;
      tip.textContent = el.dataset.explain;
      place(el);
      tip.classList.add("is-visible");
    };
    if (immediate || reduce) run();
    else showTimer = setTimeout(run, HOVER_DELAY);
  };
  const hide = () => {
    clearTimeout(showTimer);
    current = null;
    tip.classList.remove("is-visible");
  };

  els.forEach((el) => {
    el.addEventListener("pointerenter", () => show(el, false));
    el.addEventListener("pointerleave", hide);
    el.addEventListener("focus", () => show(el, true));
    el.addEventListener("blur", hide);
  });

  const reposition = () => { if (current) place(current); };
  window.addEventListener("scroll", reposition, { passive: true });
  window.addEventListener("resize", reposition);

  return tip;
}
