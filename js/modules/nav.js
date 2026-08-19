/**
 * Nav chrome: adds a subtle backdrop once the page is scrolled past the hero.
 * Uses an IntersectionObserver sentinel rather than a scroll listener.
 */
export function initNav() {
  const nav = document.querySelector(".site-nav");
  if (!nav || !("IntersectionObserver" in window)) return;

  const hero = document.getElementById("hero");
  if (hero) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        nav.setAttribute("data-scrolled", String(!entry.isIntersecting));
      },
      { rootMargin: "-72px 0px 0px 0px", threshold: 0 }
    );
    observer.observe(hero);
  }

  // The nav's own Let's Connect and the big one at the bottom of Contact are
  // the same button — showing both on screen at once reads as a duplicate,
  // not two options. Hide the nav's copy while the Contact one is in view.
  const contactCta = document.getElementById("contact-cta");
  if (contactCta) {
    const ctaObserver = new IntersectionObserver(
      ([entry]) => nav.setAttribute("data-hide-cta", String(entry.isIntersecting)),
      { threshold: 0.15 }
    );
    ctaObserver.observe(contactCta);
  }
}
