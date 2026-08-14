/**
 * DESIGNBESTI CASE STUDY — interactions.
 *
 * Self-contained (does not import the homepage's main.js). Enhancements only:
 *   · scroll-reveal for .db-in
 *   · a thin reading-progress bar
 *   · Stress Test: choose a perspective, the reading of one screen changes
 *   · Analysis: select an issue, its zone on the design highlights
 *   · the deep dive reveals on request ("Want to see how I got there?")
 * Everything degrades gracefully without JS.
 */
import { haptic } from "./modules/sound.js";
import { initCaseMotion } from "./modules/motion.js";
import { initPin } from "./modules/pin.js";

/* ---- 1 · scroll reveal --------------------------------------------------- */
function initReveal() {
  const items = [...document.querySelectorAll(".db-in")];
  if (!("IntersectionObserver" in window)) { items.forEach((i) => i.classList.add("is-in")); return; }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }),
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );
  items.forEach((i) => io.observe(i));
  return io;
}

/* ---- 2 · reading progress ------------------------------------------------ */
function initProgress() {
  const bar = document.getElementById("db-progress");
  if (!bar) return;
  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    bar.style.setProperty("--p", p.toFixed(4));
    ticking = false;
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}

/* ---- 3 · Stress Test ----------------------------------------------------- */
const PERSPECTIVES = {
  first:     { who: "First-time user",   lens: { left: "27%", top: "70%", width: "46%", height: "20%" },
    note: "I don't know what this does yet — the primary action doesn't stand out, and nothing tells me where to start." },
  power:     { who: "Power user",        lens: { left: "8%",  top: "44%", width: "84%", height: "26%" },
    note: "I do this ten times a day. The extra step is friction — give me a shortcut and stop asking me to confirm." },
  a11y:      { who: "Accessibility user", lens: { left: "8%", top: "20%", width: "60%", height: "14%" },
    note: "The secondary text is low-contrast and the controls sit close together — a screen-reader and switch flow will struggle here." },
  older:     { who: "Older user",        lens: { left: "8%",  top: "8%",  width: "84%", height: "82%" },
    note: "The type is small and the icon-only buttons don't tell me what they do. I'm not sure what's tappable." },
  distracted:{ who: "Distracted user",   lens: { left: "27%", top: "70%", width: "46%", height: "20%" },
    note: "I'm half-looking. If I glance away, nothing tells me what changed or what to do next." },
  mobile:    { who: "Mobile user",       lens: { left: "27%", top: "72%", width: "46%", height: "18%" },
    note: "On a small screen the layout stacks oddly and the key action drops below the fold — I'd miss it." },
  nonnative: { who: "Non-native speaker", lens: { left: "8%", top: "8%",  width: "55%", height: "12%" },
    note: "The wording is idiomatic — “wrap up” isn't clear. Plain words would help me trust what I'm about to do." },
};
function initStress() {
  const root = document.getElementById("stress");
  if (!root) return;
  const chips = [...root.querySelectorAll("[data-persp]")];
  const who = document.getElementById("stress-who");
  const note = document.getElementById("stress-note");
  const lens = document.getElementById("stress-lens");
  const set = (key) => {
    const p = PERSPECTIVES[key]; if (!p) return;
    chips.forEach((c) => { const on = c.dataset.persp === key; c.classList.toggle("is-active", on); c.setAttribute("aria-selected", String(on)); });
    if (who) who.textContent = p.who;
    if (note) note.textContent = p.note;
    if (lens) Object.assign(lens.style, p.lens);
  };
  chips.forEach((c) => c.addEventListener("click", () => { haptic(9); set(c.dataset.persp); }));
  set("first");
}

/* ---- 4 · Analysis zone highlight ---------------------------------------- */
function initZones() {
  const root = document.getElementById("zones");
  if (!root) return;
  const issues = [...root.querySelectorAll(".db-issue")];
  const zones = [...root.querySelectorAll(".db-zone")];
  let selected = null;
  const paint = (issue) => {
    zones.forEach((z) => z.classList.toggle("is-hot", z.dataset.zone === issue.dataset.target));
    issues.forEach((i) => i.classList.toggle("is-active", i === issue));
  };
  const select = (issue) => { selected = issue; paint(issue); };
  issues.forEach((issue) => {
    issue.addEventListener("pointerenter", () => paint(issue));           // preview
    issue.addEventListener("pointerleave", () => { if (selected) paint(selected); }); // revert
    issue.addEventListener("focus", () => paint(issue));
    issue.addEventListener("blur", () => { if (selected) paint(selected); });
    issue.addEventListener("click", () => { haptic(9); select(issue); }); // stick
    issue.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); haptic(9); select(issue); } });
  });
  if (issues[0]) select(issues[0]); // start with the first issue located
}

/* ---- 5 · Try It — perspective shift --------------------------------------- */
const TRY_DATA = {
  hierarchy: { dim: "Hierarchy",      insight: "The title and the action button carry the same visual weight. One should lead." },
  cognitive: { dim: "Cognitive load",  insight: "All fields visible at once — nothing tells the user which ones matter most." },
  usability: { dim: "Usability",       insight: "The main action sits at the bottom. A quick-scanning user might never reach it." },
  a11y:      { dim: "Accessibility",   insight: "No visible focus indicators on the form fields. A keyboard user won’t know where they are." },
};
function initTry() {
  const root = document.getElementById("db-try");
  if (!root) return;
  const ask = document.getElementById("try-ask");
  const reveal = document.getElementById("try-reveal");
  const findings = document.getElementById("try-findings");
  const picks = [...root.querySelectorAll("[data-focus]")];
  let fired = false;
  picks.forEach((btn) =>
    btn.addEventListener("click", () => {
      if (fired) return;
      fired = true;
      haptic(9);
      const key = btn.dataset.focus;
      btn.classList.add("is-active");
      const order = [key, ...Object.keys(TRY_DATA).filter((k) => k !== key)];
      order.forEach((k, i) => {
        const d = TRY_DATA[k];
        const li = document.createElement("li");
        li.className = "db-try__finding" + (k === key ? " db-try__finding--yours" : "");
        li.style.setProperty("--delay", `${i * 150}ms`);
        li.innerHTML = `<p class="db-try__dim">${d.dim}</p><p class="db-try__insight">${d.insight}</p>`;
        findings.appendChild(li);
      });
      ask.hidden = true;
      reveal.hidden = false;
    })
  );
}

/* ---- 6 · roast click-to-reveal ------------------------------------------- */
function initRoast() {
  const root = document.getElementById("db-roast");
  if (!root) return;
  const entries = [...root.querySelectorAll(".db-roast__entry")];
  const toggle = (entry) => {
    const real = entry.querySelector(".db-roast__real");
    if (!real) return;
    const opening = real.hidden;
    real.hidden = !opening;
    entry.classList.toggle("is-open", opening);
    haptic(9);
  };
  entries.forEach((entry) => {
    entry.addEventListener("click", () => toggle(entry));
    entry.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(entry); } });
  });
}

/* ---- 7 · deep dive ------------------------------------------------------- */
function initDeepDive() {
  const btn = document.getElementById("db-deepdive-btn");
  const deep = document.getElementById("db-deep");
  if (!btn || !deep) return;
  btn.addEventListener("click", () => {
    if (deep.hidden === false) return;
    haptic(14);
    deep.hidden = false;
    document.documentElement.setAttribute("data-deep-open", "true");
    btn.setAttribute("aria-expanded", "true");
    // Let layout settle, then bring the deep dive into view.
    requestAnimationFrame(() => {
      const intro = deep.querySelector(".db-deep__intro") || deep;
      intro.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* ---- 8 · going back to the portfolio ------------------------------------- */
/* Returning to the portfolio is in-site navigation, so it should land on the
 * page itself rather than replaying the intro. We leave a one-shot flag the
 * homepage consumes on arrival; because it is consumed, a later reload of the
 * homepage still opens with the light off, as a fresh visit should.
 * Only plain left-clicks count — a modifier click opens a separate tab and
 * must not spend the flag on this one's behalf. */
function initBackNav() {
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = e.target.closest('a[href^="index.html"]');
    if (!link) return;
    if (link.target && link.target !== "_self") return;
    try { sessionStorage.setItem("intro_skip", "1"); } catch (err) { /* private mode */ }
  });
}

/* ---- 9 · back to top ------------------------------------------------------ */
/* These pages are long, so returning to the top shouldn't mean a long scroll.
 * Injected rather than authored into each page: it is a pure enhancement, and
 * this way all three case studies stay in sync. */
function initToTop() {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "db-totop";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML =
    '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" ' +
    'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M8 13V3M3.5 7.5 8 3l4.5 4.5"/></svg>';
  document.body.appendChild(btn);

  const foot = document.querySelector(".db-foot");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Native smooth scrolling paces itself by distance, so on a case study this
  // long it crawls for several seconds. Drive it instead with a duration capped
  // near the page's own slow transition, and let any real scroll input cancel it.
  let raf = null;
  const cancel = () => { if (raf) { cancelAnimationFrame(raf); raf = null; } };
  window.addEventListener("wheel", cancel, { passive: true });
  window.addEventListener("touchstart", cancel, { passive: true });

  const toTop = () => {
    const start = window.scrollY;
    if (start <= 0) return;
    if (reduce) { window.scrollTo(0, 0); return; }
    cancel();
    const dur = Math.min(700, 260 + start * 0.06);
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3); // power3.out — the page's own curve
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      // "instant" matters: the site sets scroll-behavior:smooth globally, which
      // would animate every frame of this animation and fight the easing.
      window.scrollTo({ top: Math.round(start * (1 - ease(t))), behavior: "instant" });
      raf = t < 1 ? requestAnimationFrame(step) : null;
    };
    raf = requestAnimationFrame(step);
  };

  btn.addEventListener("click", (e) => {
    haptic(9);
    toTop();
    // Keyboard activation reports detail 0 — then the focus should travel too,
    // otherwise a keyboard user is returned to the top but left tabbing from
    // the bottom of the document.
    if (e.detail === 0) {
      const back = document.querySelector(".db-top__back");
      if (back) back.focus({ preventScroll: true });
    }
  });

  let ticking = false;
  const update = () => {
    btn.classList.toggle("is-on", window.scrollY > window.innerHeight * 0.75);
    // Ride up ahead of the footer rather than sitting on top of its text.
    if (foot) {
      const lift = Math.max(0, window.innerHeight - foot.getBoundingClientRect().top);
      // Shared: the prototype trigger docks against the same edge and has to
      // ride up with the footer too.
      document.documentElement.style.setProperty("--dock-lift", `${lift}px`);
    }
    ticking = false;
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
}

/* ---- 10 · interactive prototype ------------------------------------------ */
/* Reads the <div id="proto"> declaration and mounts a trigger that is
 * reachable from any point in the story. The iframe is built on open and
 * destroyed on close: Figma is a heavy third party and must never load with
 * the page, nor keep running behind a closed overlay. */
function initPrototype() {
  const cfg = document.getElementById("proto");
  if (!cfg || !cfg.dataset.embed) return;

  const [w, h] = (cfg.dataset.device || "375x812").split("x").map(Number);
  const label = cfg.dataset.label || "Interactive prototype";

  const fab = document.createElement("button");
  fab.type = "button";
  fab.className = "proto-fab";
  fab.innerHTML = '<span class="proto-fab__dot" aria-hidden="true"></span>Try the prototype';
  fab.setAttribute("aria-haspopup", "dialog");

  const modal = document.createElement("div");
  modal.className = "proto-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", label);
  modal.innerHTML =
    '<div class="proto-bar">' +
      '<span class="proto-bar__t">' + label + "</span>" +
      '<span class="proto-bar__acts">' +
        '<a class="proto-btn" target="_blank" rel="noopener" href="' + cfg.dataset.open + '">Open in Figma</a>' +
        '<button type="button" class="proto-btn proto-btn--solid" data-close>Close</button>' +
      "</span>" +
    "</div>" +
    '<div class="proto-stage">' +
      '<div class="proto-fit">' +
      '<div class="proto-device" style="--screen-w:' + w + "px;--screen-h:" + h + 'px">' +
        '<div class="proto-screen">' +
          '<span class="proto-notch" aria-hidden="true"></span>' +
          '<p class="proto-loading">Loading prototype…</p>' +
        "</div>" +
      "</div>" +
      "</div>" +
    "</div>" +
    '<p class="proto-foot">iPhone 13 mini · ' + w + " × " + h + "pt</p>";

  document.body.append(fab, modal);

  const device = modal.querySelector(".proto-device");
  const screen = modal.querySelector(".proto-screen");
  const closeBtn = modal.querySelector("[data-close]");

  // The device is a fixed 375×812; scale it to whatever room the viewport has
  // rather than letting it overflow or forcing the page to scroll.
  const fitBox = modal.querySelector(".proto-fit");
  const fit = () => {
    const availH = window.innerHeight - 150;
    const availW = window.innerWidth - 32;
    const sc = Math.min(1, availH / (h + 24), availW / (w + 24));
    device.style.setProperty("--proto-scale", sc.toFixed(3));
    // A transform shrinks what you see, not the space it occupies — without
    // sizing the wrapper too, the layout box stays full height and pushes the
    // caption off the bottom of the overlay.
    fitBox.style.width = Math.round((w + 24) * sc) + "px";
    fitBox.style.height = Math.round((h + 24) * sc) + "px";
  };

  let last = null;
  const open = () => {
    last = document.activeElement;
    if (!screen.querySelector("iframe")) {
      const f = document.createElement("iframe");
      f.title = label;
      f.allow = "fullscreen";
      f.loading = "lazy";
      f.src = cfg.dataset.embed;
      f.addEventListener("load", () => {
        const p = screen.querySelector(".proto-loading");
        if (p) p.remove();
      });
      screen.appendChild(f);
    }
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    fit();
    closeBtn.focus();
  };
  const close = () => {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    const f = screen.querySelector("iframe");
    if (f) f.remove();                          // stop it running once hidden
    const p = screen.querySelector(".proto-loading");
    if (!p) screen.insertAdjacentHTML("beforeend", '<p class="proto-loading">Loading prototype…</p>');
    if (last) last.focus();
  };

  fab.addEventListener("click", () => { haptic(12); open(); });
  closeBtn.addEventListener("click", close);
  modal.addEventListener("mousedown", (e) => { if (e.target === modal) close(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) close();
  });
  window.addEventListener("resize", () => {
    if (modal.classList.contains("is-open")) fit();
  }, { passive: true });
}

const boot = () => { if (!initCaseMotion()) initReveal(); initProgress(); initStress(); initZones(); initTry(); initRoast(); initDeepDive(); initBackNav(); initToTop(); initPin(window.gsap, window.ScrollTrigger); initPrototype(); };
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
else boot();
