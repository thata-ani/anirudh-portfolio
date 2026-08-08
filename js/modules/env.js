/**
 * Shared environment helpers.
 * Motion preference is read live so it responds if the user changes it mid-session.
 */

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

export const prefersReducedMotion = () => reducedMotionQuery.matches;

/** Small helper: run once the element enters the viewport, then stop observing. */
export function onEnterView(elements, callback, options = {}) {
  const items = Array.isArray(elements) ? elements : [...elements];
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => callback(el));
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px", ...options }
  );

  items.forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}
