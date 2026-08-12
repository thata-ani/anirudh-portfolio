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

/* ---- 6 · deep dive ------------------------------------------------------- */
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

const boot = () => { initReveal(); initProgress(); initStress(); initZones(); initTry(); initDeepDive(); };
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
else boot();
