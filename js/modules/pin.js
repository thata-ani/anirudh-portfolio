/**
 * PINNED SEQUENCES — experimental, opt-in via ?pin=1
 *
 * Holds a section still while the scroll advances through its items, so the
 * scroll carries the argument instead of just moving the page. Off by default:
 * a visitor without the flag gets exactly the site as it shipped.
 *
 * The items share one slot rather than sitting in a dimmed list. A list long
 * enough to be worth pinning is taller than the screen, and pinning something
 * taller than the screen just crops it — so only the current step occupies the
 * stage, and the section is guaranteed to fit while held.
 */

const FLAG = "pin";

export function pinEnabled() {
  try {
    const q = new URLSearchParams(location.search).get(FLAG);
    if (q === "1") { sessionStorage.setItem("pin_on", "1"); return true; }
    if (q === "0") { sessionStorage.removeItem("pin_on"); return false; }
    return sessionStorage.getItem("pin_on") === "1";
  } catch (e) { return false; }
}

/* A visible way to compare without hand-editing the URL. Only ever shown to
   someone who already asked for the experiment. */
function mountToggle(on) {
  const bar = document.createElement("div");
  bar.className = "pin-flag";
  bar.innerHTML =
    '<span class="pin-flag__dot" aria-hidden="true"></span>' +
    "<span>Pinned motion <b>" + (on ? "on" : "off") + "</b></span>" +
    "<button type=\"button\">" + (on ? "Compare without" : "Turn on") + "</button>";
  bar.querySelector("button").addEventListener("click", () => {
    const url = new URL(location.href);
    url.searchParams.set(FLAG, on ? "0" : "1");
    location.href = url.toString();
  });
  document.body.appendChild(bar);
}

/* Sequences worth advancing — only the ones that are genuinely inert lists.
   #work (scattered-to-organized) and #rules (click to earn readability) each
   already carry a designed interaction, and holding them still fights it:
   #rules in particular starts deliberately unreadable, so a pinned #rules is
   a pinned blank panel. #experience is excluded too now — it has its own,
   permanent pinned *horizontal* scroll (horizontal-roadmap.js), and running
   this crossfade version on top of that would pin the section twice. */
const TARGETS = [
  { host: "#process", items: ".process__stage" },
  { host: ".db-journey", items: ".db-journey__phase" },
  { host: ".db-techflow", items: ".db-techflow__step" },
  { host: ".ar-ctx", items: ".ar-ctx__row" },
  { host: ".if-evo", items: ".if-evo__step" },
  { host: ".cw-flow", items: ".cw-flow__step" },
];
const MAX_PER_PAGE = 4;

export function initPin(gsap, ScrollTrigger) {
  const on = pinEnabled();
  let asked = false;
  try {
    asked = new URLSearchParams(location.search).has(FLAG) ||
      sessionStorage.getItem("pin_on") === "1";
  } catch (e) { /* private mode */ }
  if (asked) mountToggle(on);
  if (!on || !gsap || !ScrollTrigger) return false;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

  document.documentElement.setAttribute("data-pin", "on");

  let built = 0;
  for (const t of TARGETS) {
    if (built >= MAX_PER_PAGE) break;
    for (const host of document.querySelectorAll(t.host)) {
      if (built >= MAX_PER_PAGE) break;
      const items = [...host.querySelectorAll(t.items)];
      if (items.length < 3) continue;            // two steps isn't a sequence
      if (!items.every((el) => el.parentElement === items[0].parentElement)) continue;
      if (makeSequence(gsap, ScrollTrigger, host, items)) built += 1;
    }
  }
  ScrollTrigger.refresh();
  return built > 0;
}

function makeSequence(gsap, ScrollTrigger, host, items) {
  const stage = items[0].parentElement;

  // Measure every step at its natural height before collapsing them into one
  // slot, so the stage is tall enough for the longest step and the pinned
  // section never resizes as it advances.
  let tallest = 0;
  items.forEach((el) => { tallest = Math.max(tallest, el.getBoundingClientRect().height); });
  stage.style.setProperty("--pin-h", Math.ceil(tallest) + "px");

  // Collapse to a single slot first, then judge the fit. Measuring after the
  // held-section styling would measure that styling's own 100vh floor and
  // reject everything.
  stage.classList.add("pin-stage");
  // Tagging each step lets the hide rule outrank the site's own
  // [data-anim].is-visible reveal, which otherwise forces every step visible
  // and stacks them on top of each other.
  items.forEach((el) => el.classList.add("pin-step"));

  const n = items.length;
  const paint = (i) => items.forEach((el, k) => el.classList.toggle("is-lit", k === i));
  paint(0);

  // If it still cannot be held whole, leave it unpinned rather than crop it.
  if (host.getBoundingClientRect().height > window.innerHeight * 0.96) {
    stage.classList.remove("pin-stage");
    stage.style.removeProperty("--pin-h");
    items.forEach((el) => el.classList.remove("is-lit", "pin-step"));
    return false;
  }
  host.classList.add("pin-seq");

  ScrollTrigger.create({
    trigger: host,
    start: "top top",
    end: "+=" + Math.round(window.innerHeight * 0.7 * n),
    pin: true,
    pinSpacing: true,
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate(self) {
      paint(Math.max(0, Math.min(n - 1, Math.floor(self.progress * n * 1.04))));
    },
    onLeave: () => paint(n - 1),
    onLeaveBack: () => paint(0),
  });
  return true;
}
