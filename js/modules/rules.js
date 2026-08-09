/**
 * RULES — Principle: simple language / meaningful interaction ("Click less").
 *
 * The rules first appear as ONE dense, over-qualified paragraph — perfectly
 * legible, but written the way most products are: hard to act on. A quiet bar
 * fills 25% per click. Nothing else moves — no changing words, no churn. On the
 * fourth click the paragraph gives way to the five plain rules it was always
 * trying to say.
 *
 * Complex language makes people work; simple language makes the product grow.
 * The interaction is the lesson — rule 01. Content is the approved rules only.
 */
import { haptic } from "./sound.js";

const TARGET = 4;

export function initRules() {
  const section = document.getElementById("rules");
  const btn = document.getElementById("rules-click");
  if (!section || !btn) return;
  const fill = document.getElementById("rules-meter");
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
    if (reduce || !cipher) {
      finish();
    } else {
      cipher.classList.add("is-out"); // dense paragraph fades away…
      setTimeout(finish, 420); // …then the plain rules arrive
    }
    if (aha) {
      aha.textContent =
        "That paragraph and these five lines mean the same thing — but one made " +
        "you work to read it. Simpler language, better product. That is rule 01.";
    }
  };

  btn.addEventListener("click", () => {
    if (revealed) return;
    clicks += 1;
    haptic(clicks >= TARGET ? 16 : 8);
    // Silent progress only — the bar fills, nothing else changes.
    const pct = Math.min(100, Math.round((clicks / TARGET) * 100));
    if (fill) fill.style.width = `${pct}%`;
    section.setAttribute("data-clicks", String(clicks));
    if (clicks >= TARGET) reveal();
  });
}
