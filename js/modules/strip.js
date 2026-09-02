/**
 * FIELD STRIP — a horizontal run of documentary photographs. EXPERIMENTAL.
 *
 * The photos are mixed portrait and landscape, so the strip fixes their height
 * and lets each keep its own width: no cropping, no forced uniform tiles.
 *
 * It drifts on its own so the row reads as a continuous strip rather than a
 * static grid, but it is a real scroll container underneath — wheel, trackpad,
 * touch and drag all work, and any of them stops the drift while you're
 * looking. The items are duplicated once so the wrap is seamless.
 */
export function initStrip() {
  const root = document.querySelector(".cw2-strip");
  if (!root) return;
  const track = root.querySelector(".cw2-strip__track");
  if (!track) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // A second copy makes the loop seamless: once the scroll passes the width of
  // the original set, it is rewound by exactly that much and nothing jumps.
  const originals = [...track.children];
  originals.forEach((el) => {
    const clone = el.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });

  let half = 0;
  const measure = () => { half = track.scrollWidth / 2; };
  measure();
  window.addEventListener("resize", measure, { passive: true });
  // Photos settle late; remeasure once they have real dimensions.
  root.querySelectorAll("img").forEach((img) => {
    if (!img.complete) img.addEventListener("load", measure, { once: true });
  });

  const SPEED = 0.7;            // px per frame — a drift, not a carousel
  const RESUME_AFTER = 2000;    // idle before the drift picks up again
  let paused = false;
  let idle = null;

  const hold = () => {
    paused = true;
    clearTimeout(idle);
    idle = setTimeout(() => { paused = false; }, RESUME_AFTER);
  };

  root.addEventListener("pointerenter", () => { paused = true; clearTimeout(idle); });
  root.addEventListener("pointerleave", () => { paused = false; });
  root.addEventListener("wheel", hold, { passive: true });
  root.addEventListener("touchstart", hold, { passive: true });

  /* ---- drag to pan, for anyone without a horizontal scroll gesture ------- */
  let down = false, startX = 0, startLeft = 0, moved = false;
  root.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    down = true; moved = false;
    startX = e.clientX;
    startLeft = root.scrollLeft;
    paused = true;
    clearTimeout(idle);
  });
  root.addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 3) {
      moved = true;
      root.classList.add("is-dragging");
      // Mouse drag only; touch already pans natively and would double up.
      if (e.pointerType === "mouse") root.scrollLeft = startLeft - dx;
    }
  });
  const release = () => {
    if (!down) return;
    down = false;
    root.classList.remove("is-dragging");
    hold();
  };
  root.addEventListener("pointerup", release);
  root.addEventListener("pointercancel", release);
  root.addEventListener("pointerleave", release);
  // A drag that ends on a photo shouldn't also count as a click on it.
  root.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

  if (reduce) return; // static strip; scrolling by hand still works

  // The position is accumulated here rather than compounded onto scrollLeft:
  // a sub-pixel `scrollLeft += 0.7` is rounded away every frame and the strip
  // never actually moves. Reading it back while paused keeps the drift in sync
  // with wherever a manual scroll left off.
  let pos = 0;
  const step = () => {
    if (paused || half <= 0) {
      pos = root.scrollLeft;
    } else {
      pos += SPEED;
      if (pos >= half) pos -= half;
      root.scrollLeft = pos;
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
