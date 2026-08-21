/**
 * EXPERIENCE — pinned horizontal scroll through the career roadmap.
 *
 * Instead of scrolling straight down past a vertical list, the Experience
 * section holds still while the scroll gesture carries the roadmap sideways
 * — starting at 2014, through each stop, to "Next". Once the last card
 * arrives, the pin releases and the page continues down as normal, into the
 * evolution line beneath it.
 *
 * Runs at every width now, mobile included, so the story reads the same way
 * everywhere: pin, carry the roadmap sideways with the scroll gesture
 * (touch included — ScrollTrigger's own scrub handles touch natively),
 * release once the last stop arrives. Under reduced motion this never runs
 * — css/sections.css already gives .roadmap__viewport a plain, native,
 * snap-scrolling horizontal strip for that case, so the content stays
 * reachable either way.
 */
export function initHorizontalRoadmap(gsap, ScrollTrigger) {
  const viewport = document.querySelector(".roadmap__viewport");
  const track = viewport?.querySelector(".roadmap");
  if (!viewport || !track || !gsap || !ScrollTrigger) return false;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

  const distance = () => track.scrollWidth - viewport.clientWidth;
  // Nothing to pin for — every card already fits without scrolling sideways.
  if (distance() <= 0) return false;

  gsap.to(track, {
    x: () => -distance(),
    ease: "none",
    scrollTrigger: {
      trigger: viewport,
      start: "top top",
      end: () => "+=" + distance(),
      pin: true,
      scrub: true,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });

  return true;
}
