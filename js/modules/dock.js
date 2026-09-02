/**
 * DOCK — one persistent control for the whole case study. EXPERIMENTAL.
 *
 * A case study is long, and the controls it needs were scattered across three
 * separate floating things (a prototype trigger bottom-left, a back-to-top
 * bottom-right, a sticky header up top). This consolidates the ones that
 * matter into a single dock that stays reachable while scrolling:
 *
 *   [ mark → back to the portfolio ] [ chapter nav, tracking where you are ]
 *   [ the one primary action on this page ]
 *
 * Chapters are read from `data-chapter` on the page's own sections, so a case
 * study opts in by labelling its sections — nothing here is page-specific.
 */
import { haptic } from "./sound.js";
import { getLenis } from "./smooth-scroll.js";

export function initDock() {
  const chapters = [...document.querySelectorAll("main [data-chapter]")];
  if (chapters.length < 2) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pad = (n) => String(n).padStart(2, "0");

  const dock = document.createElement("nav");
  dock.className = "cw-dock";
  dock.setAttribute("aria-label", "Case study navigation");

  // 1 · the mark — the way back, same destination as the header's back link.
  const mark = document.createElement("a");
  mark.className = "cw-dock__mark";
  mark.href = "index.html";
  mark.innerHTML = '<span aria-hidden="true">AT</span>';
  mark.setAttribute("aria-label", "Back to the portfolio");
  mark.dataset.explain = "Back to the portfolio";

  // 2 · chapter nav — where you are, and a way to any other chapter.
  const list = document.createElement("ul");
  list.className = "cw-dock__list";
  const items = chapters.map((section, i) => {
    if (!section.id) section.id = `chapter-${i + 1}`;
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cw-dock__item";
    btn.innerHTML =
      '<i aria-hidden="true">' + pad(i + 1) + "</i>" +
      '<span class="cw-dock__name">' + section.dataset.chapter + "</span>";
    btn.setAttribute("aria-label", `Chapter ${i + 1}: ${section.dataset.chapter}`);
    btn.addEventListener("click", () => {
      haptic(9);
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(section, { offset: 0 });
      else section.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
    li.appendChild(btn);
    list.appendChild(li);
    return btn;
  });

  // One indicator that travels between chapters rather than a box blinking on
  // and off — it is measured from the active button, so it stays correct when
  // the labels collapse to numbers at the narrow breakpoint.
  const glide = document.createElement("span");
  glide.className = "cw-dock__glide";
  glide.setAttribute("aria-hidden", "true");
  list.appendChild(glide);

  dock.append(mark, list);

  /* 3 · the primary action — whatever *this* case study most wants offered.
   * Resolved from the page rather than hardcoded, in priority order:
   *   · a prototype declaration  → open it (the trigger already owns that
   *     logic, so the dock is just another handle on it, and the loose
   *     floating pill is hidden — see `body:has(.cw-dock) .proto-fab`)
   *   · any element marked [data-dock-action] → press it, labelled by the
   *     attribute (a deep dive, a demo — whatever the page's own moment is)
   *   · nothing to demonstrate → the standing invitation to get in touch
   * Each label carries a short form too: the full phrase has no room on a
   * phone beside the chapter nav, and truncating mid-word reads as a bug. */
  const labelled = (el, long, short) => {
    el.className = "cw-dock__cta";
    el.innerHTML =
      '<span class="cw-dock__cta-long">' + long + "</span>" +
      '<span class="cw-dock__cta-short">' + short + "</span>";
    return el;
  };

  const proto = document.getElementById("proto");
  const declared = document.querySelector("[data-dock-action]");
  if (proto && proto.dataset.embed) {
    const cta = labelled(document.createElement("button"), "Try the prototype", "Prototype");
    cta.type = "button";
    cta.addEventListener("click", () => document.querySelector(".proto-fab")?.click());
    dock.appendChild(cta);
  } else if (declared) {
    const [long, short] = declared.dataset.dockAction.split("|");
    const cta = labelled(document.createElement("button"), long, short || long);
    cta.type = "button";
    cta.addEventListener("click", () => declared.click());
    dock.appendChild(cta);
  } else {
    const cta = labelled(document.createElement("a"), "Let's connect", "Connect");
    cta.href = "index.html#contact";
    dock.appendChild(cta);
  }

  document.body.appendChild(dock);

  /* ---- scroll spy: which chapter is being read right now ---------------- */
  const foot = document.querySelector(".db-foot");

  let ticking = false;
  // A control that sits there through a long read is clutter in the corner of
  // the eye. The dock belongs to *moving* through the story, not to reading it:
  // scrolling calls it up, and a pause — which is what reading looks like —
  // lets it drop back off the bottom edge. Held open while the pointer is over
  // it or focus is inside, so it can't slide away mid-interaction.
  const IDLE_MS = 1600;
  let awake = false;
  let held = false;
  let idle = null;

  const apply = () => {
    const started = window.scrollY > window.innerHeight * 0.6;
    const ended = foot ? foot.getBoundingClientRect().top <= window.innerHeight : false;
    dock.classList.toggle("is-on", started && !ended && (awake || held));
  };

  const rest = () => {
    clearTimeout(idle);
    idle = setTimeout(() => { awake = false; apply(); }, IDLE_MS);
  };

  const wake = () => {
    awake = true;
    apply();
    rest();
  };

  dock.addEventListener("pointerenter", () => { held = true; clearTimeout(idle); apply(); });
  dock.addEventListener("pointerleave", () => { held = false; rest(); });
  dock.addEventListener("focusin", () => { held = true; clearTimeout(idle); apply(); });
  dock.addEventListener("focusout", () => { held = false; rest(); });

  const update = () => {
    ticking = false;
    apply();

    // The chapter whose top has most recently passed the reading line.
    const line = window.innerHeight * 0.4;
    let active = -1;
    chapters.forEach((section, i) => {
      if (section.getBoundingClientRect().top <= line) active = i;
    });
    items.forEach((btn, i) => {
      const on = i === active;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-current", on ? "true" : "false");
    });
    dock.classList.toggle("is-preface", active < 0);

    const on = items[active];
    if (on) {
      list.style.setProperty("--gx", `${on.offsetLeft}px`);
      list.style.setProperty("--gy", `${on.offsetTop}px`);
      list.style.setProperty("--gw", `${on.offsetWidth}px`);
      list.style.setProperty("--gh", `${on.offsetHeight}px`);
    }
    list.classList.toggle("has-glide", !!on);
  };
  const onScroll = () => {
    wake();
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}
