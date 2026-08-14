/**
 * Scroll-reveal for editorial sections.
 * Supports three entrance verbs: rise, unveil, draw.
 * Staggered per group so a row of items cascades.
 */
import { onEnterView, prefersReducedMotion } from "./env.js";

export function initReveal() {
  const items = document.querySelectorAll('[data-anim="rise"], [data-anim="unveil"], [data-anim="draw"]');
  if (!items.length) return;

  if (prefersReducedMotion()) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  onEnterView(items, (el) => {
    const anim = el.getAttribute("data-anim");
    const siblings = [...el.parentElement.querySelectorAll(`[data-anim="${anim}"]`)];
    const index = Math.max(0, siblings.indexOf(el));
    el.style.transitionDelay = `${Math.min(index, 8) * 70}ms`;
    el.classList.add("is-visible");
  });
}
