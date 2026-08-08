/**
 * EXPLORE — makes passive lists explorable (Process stages, Career stops).
 *
 * Desktop reveals detail on hover (CSS); this adds click + keyboard so touch
 * and keyboard users can open a stage too. One open at a time per group, so the
 * visitor moves through the decisions/milestones and sees what each one changes.
 */
import { haptic } from "./sound.js";

export function initExplore() {
  document.querySelectorAll("[data-explore]").forEach((group) => {
    const items = [...group.querySelectorAll("[data-explore-item]")];
    items.forEach((item) => {
      item.setAttribute("tabindex", "0");
      item.setAttribute("role", "button");
      const toggle = () => {
        haptic(8);
        const open = item.classList.contains("is-active");
        items.forEach((i) => i.classList.remove("is-active"));
        if (!open) item.classList.add("is-active");
      };
      item.addEventListener("click", toggle);
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    });
  });
}
