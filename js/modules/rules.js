/**
 * RULES — Principle: meaningful interaction ("Relevant to click less").
 *
 * The rules don't appear on their own. The visitor has to click, and click,
 * and click again — a small progress meter creeps up 25% at a time. By the
 * fourth click they're asking "why am I clicking so much?" — which is exactly
 * the point: the effort demonstrates the cost of interaction. Then the rules
 * reveal, and rule 01 names what just happened: relevant to click less.
 *
 * A demonstration of interaction cost → user effort → meaningful action, not
 * a gimmick. Content is the approved rules only.
 */
import { haptic } from "./sound.js";

const TARGET = 4;
const NUDGES = [
  "Loading the rules…",
  "Still loading. Click again.",
  "Really — more clicks?",
  "Why are you clicking so much?",
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

  let clicks = 0;

  const reveal = () => {
    section.setAttribute("data-revealed", "true");
    btn.setAttribute("aria-disabled", "true");
    if (label) label.textContent = "Revealed";
    if (nudge) nudge.textContent = "";
    if (aha) {
      aha.textContent =
        `That took ${clicks} clicks to reveal what one could have. ` +
        `That is rule 01 — relevant to click less.`;
    }
  };

  btn.addEventListener("click", () => {
    if (section.getAttribute("data-revealed") === "true") return;
    clicks += 1;
    haptic(clicks >= TARGET ? 16 : 8);
    const pct = Math.min(100, Math.round((clicks / TARGET) * 100));
    if (fill) fill.style.width = `${pct}%`;
    if (count) count.textContent = `${pct}%`;
    section.setAttribute("data-clicks", String(clicks));
    if (nudge) nudge.textContent = NUDGES[Math.min(clicks, NUDGES.length) - 1] || "";
    if (label && clicks < TARGET) label.textContent = "Click again";
    if (clicks >= TARGET) reveal();
  });
}
