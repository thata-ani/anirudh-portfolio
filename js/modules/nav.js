/**
 * Nav chrome: adds a subtle backdrop once the page is scrolled past the hero.
 * Uses an IntersectionObserver sentinel rather than a scroll listener.
 */
export function initNav() {
  const nav = document.querySelector(".site-nav");
  const hero = document.getElementById("hero");
  if (!nav || !hero || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      nav.setAttribute("data-scrolled", String(!entry.isIntersecting));
    },
    { rootMargin: "-72px 0px 0px 0px", threshold: 0 }
  );
  observer.observe(hero);
}
