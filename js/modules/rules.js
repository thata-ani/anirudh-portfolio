/**
 * RULES — Principle: meaningful interaction / simple language ("Click less").
 *
 * The rules first appear as ONE dense, over-qualified paragraph — perfectly
 * legible, but written the way most products are: hard to act on. The visitor
 * has to click, and click, and click again to "simplify" it; a meter creeps up
 * 25% at a time. On the fourth click the paragraph gives way to the five plain
 * rules it was always trying to say.
 *
 * Complex language makes people work; simple language makes the product grow.
 * The interaction is the lesson — which is rule 01: click less, say it simply,
 * make every word (and every click) count. Content is the approved rules only.
 */
import { haptic } from "./sound.js";

const TARGET = 4;
const NUDGES = [
  "Simplifying…",
  "Still simplifying. Click again.",
  "Almost plain.",
  "Four clicks to make it simple. That's the point.",
];

export function initRules() {
  const section = document.getElementById("rules");
  const btn = document.getElementById("rules-click");
  if (!section || !btn) return;
  const fill = document.getElementById("rules-meter");
  const label = document.getElementById("rules-click-label");
  const count = document.getElementById("rules-count");
  const nudge = document.getElementById("rules-nudge");
  const aha = document.getElementById("rules-aha");
  const cipher = document.getElementById("rules-cipher");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Progressive enhancement: only with JS do we hide the plain rules behind the
  // dense paragraph. Without JS the real rules are shown directly.
  section.setAttribute("data-mode", "locked");

  let clicks = 0;
  let revealed = false;

  const finish = () => {
    section.setAttribute("data-mode", "revealed");
    section.setAttribute("data-revealed", "true");
  };

  const reveal = () => {
    revealed = true;
    btn.setAttribute("aria-disabled", "true");
    if (label) label.textContent = "Simplified";
    if (nudge) nudge.textContent = "";

    if (reduce || !cipher) {
      finish();
    } else {
      cipher.classList.add("is-out"); // dense paragraph fades away…
      setTimeout(finish, 420); // …then the plain rules arrive
    }

    if (aha) {
      aha.textContent =
        `That paragraph and these five lines mean the same thing — but one made ` +
        `you work to read it. Simpler language, better product. That is rule 01.`;
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
    // Each click visibly thins the dense prose — feedback that it's simplifying.
    if (cipher && !reduce) cipher.style.opacity = String(Math.max(0.3, 1 - clicks * 0.14));
    if (clicks >= TARGET) reveal();
  });
}
