/**
 * SCROLL-VELOCITY SKEW — experimental.
 *
 * The hero headline leans in the direction of travel while the page is
 * moving fast, and relaxes back to flat the moment scroll settles. Reads
 * ScrollTrigger's own velocity, which — now that Lenis drives scroll — is a
 * smooth, continuous curve rather than the jumpy per-wheel-tick value native
 * scroll would report.
 *
 * The canonical GSAP recipe for this: only start a new decay tween when a
 * bigger velocity spike arrives, rather than re-tweening on every scroll
 * frame. Re-tweening every frame fights its own previous tween and never
 * fully settles — this is what keeps the lean reading as "responding to
 * speed" instead of jittering.
 */
export function initSkewScroll(gsap, ScrollTrigger) {
  const target = document.getElementById("hero-title");
  if (!target || !gsap || !ScrollTrigger) return false;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

  const MAX_SKEW = 6; // degrees — a lean, not a warp
  const clamp = gsap.utils.clamp(-MAX_SKEW, MAX_SKEW);
  const proxy = { skew: 0 };
  const setSkew = gsap.quickSetter(target, "skewY", "deg");

  gsap.set(target, { transformOrigin: "center center", force3D: true });

  ScrollTrigger.create({
    trigger: document.body,
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const skew = clamp(self.getVelocity() / -300);
      if (Math.abs(skew) > Math.abs(proxy.skew)) {
        proxy.skew = skew;
        gsap.to(proxy, {
          skew: 0,
          duration: 0.8,
          ease: "power3",
          overwrite: true,
          onUpdate: () => setSkew(proxy.skew),
        });
      }
    },
  });

  return true;
}
