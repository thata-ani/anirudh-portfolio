/**
 * RULES — Principle: meaningful interaction ("Click less").
 *
 * The rules are not shown. Each row is filled with ENCODED, difficult-to-read
 * text — scrambled glyphs, not the rules. The visitor has to click, and click,
 * and click again; each click "decodes" a little, a meter creeps up 25% at a
 * time. Only on the fourth click does the gibberish resolve into the actual
 * rules. You literally worked to read what one clear line could have said —
 * which is exactly rule 01: click less, every interaction should have meaning.
 *
 * A demonstration of interaction cost → user effort → meaningful action, not a
 * gimmick. Content is the approved rules only; the scramble is presentational.
 */
import { haptic } from "./sound.js";

const TARGET = 4;
const NUDGES = [
  "Decoding…",
  "Still decoding. Click again.",
  "Really — more clicks?",
  "All that just to read it. That's the point.",
];
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const rand = (n) => Math.floor(Math.random() * n);

/** Same-length gibberish; spaces/newlines preserved so it reads as "text". */
function scramble(real) {
  let out = "";
  for (let i = 0; i < real.length; i++) {
    const ch = real[i];
    out += ch === " " || ch === "\n" ? ch : GLYPHS[rand(GLYPHS.length)];
  }
  return out;
}

export function initRules() {
  const section = document.getElementById("rules");
  const btn = document.getElementById("rules-click");
  if (!section || !btn) return;
  const fill = document.getElementById("rules-meter");
  const label = document.getElementById("rules-click-label");
  const count = document.getElementById("rules-count");
  const nudge = document.getElementById("rules-nudge");
  const aha = document.getElementById("rules-aha");
  const texts = Array.from(section.querySelectorAll(".rule__text"));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Encode every rule: stash the real text, render scrambled glyphs in its place.
  texts.forEach((el) => {
    el.dataset.real = el.textContent;
    el.textContent = scramble(el.dataset.real);
  });

  let clicks = 0;
  let revealed = false;

  // A brief "decoding" churn on each pre-reveal click — the glyphs flicker, then
  // settle back to (still unreadable) gibberish. Feedback without giving it away.
  const churn = (ms = 420) => {
    if (reduce) {
      texts.forEach((el) => { el.textContent = scramble(el.dataset.real); });
      return;
    }
    const end = performance.now() + ms;
    const tick = (now) => {
      texts.forEach((el) => { el.textContent = scramble(el.dataset.real); });
      if (now < end) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // The payoff: the gibberish resolves left-to-right into the real rules,
  // staggered row by row.
  const resolve = () => {
    revealed = true;
    section.setAttribute("data-revealed", "true");
    btn.setAttribute("aria-disabled", "true");
    if (label) label.textContent = "Decoded";
    if (nudge) nudge.textContent = "";

    if (reduce) {
      texts.forEach((el) => { el.textContent = el.dataset.real; });
    } else {
      texts.forEach((el, idx) => {
        const real = el.dataset.real;
        const total = real.length;
        const frames = 26;
        let f = 0;
        const step = () => {
          f += 1;
          const shown = Math.floor((f / frames) * total);
          let out = "";
          for (let i = 0; i < total; i++) {
            const ch = real[i];
            out += i < shown || ch === " " || ch === "\n" ? ch : GLYPHS[rand(GLYPHS.length)];
          }
          el.textContent = out;
          if (f < frames) requestAnimationFrame(step);
          else el.textContent = real;
        };
        setTimeout(step, idx * 130);
      });
    }

    if (aha) {
      aha.textContent =
        `That took ${clicks} clicks to decode what one clear line could have said. ` +
        `That is rule 01 — click less.`;
    }
  };

  btn.addEventListener("click", () => {
    if (revealed) return;
    clicks += 1;
    haptic(clicks >= TARGET ? 16 : 8);
    const pct = Math.min(100, Math.round((clicks / TARGET) * 100));
    if (fill) fill.style.width = `${pct}%`;
    if (count) count.textContent = `${pct}%`;
    section.setAttribute("data-clicks", String(clicks));
    if (nudge) nudge.textContent = NUDGES[Math.min(clicks, NUDGES.length) - 1] || "";
    if (label && clicks < TARGET) label.textContent = "Click again";
    if (clicks >= TARGET) resolve();
    else churn();
  });
}
