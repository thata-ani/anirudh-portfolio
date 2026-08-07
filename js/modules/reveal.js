/**
 * Scroll-reveal for editorial sections (What I Believe, Process, Experience…).
 * Elements marked [data-anim="rise"] settle into place when scrolled into view.
 * Staggered per group so a row of items cascades rather than snapping together.
 */
import { onEnterView, prefersReducedMotion } from "./env.js";

export function initReveal() {
  const items = document.querySelectorAll('[data-anim="rise"]');
  if (!items.length) return;

  if (prefersReducedMotion()) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  // Give siblings a gentle cascade based on their index within the parent.
  onEnterView(items, (el) => {
    const siblings = [...el.parentElement.querySelectorAll('[data-anim="rise"]')];
    const index = Math.max(0, siblings.indexOf(el));
    el.style.transitionDelay = `${Math.min(index, 8) * 70}ms`;
    el.classList.add("is-visible");
  });
}
