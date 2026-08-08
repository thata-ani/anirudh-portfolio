/**
 * CONTACT — Principle: Connection.
 *
 * The final product moment. On entering, the CTA settles with one subtle move
 * (a reflection beat — no sound yet). Activating "Get in Touch" is the final
 * product action: the product responds one last time (a short premium cue +
 * light haptic) and the ways to reach out become available.
 * Action → response → meaning.
 */
import { playCue, haptic } from "./sound.js";

export function initContact() {
  const section = document.getElementById("contact");
  const button = document.getElementById("contact-cta");
  const ping = document.getElementById("contact-ping");
  if (!section || !button) return;

  // Arrival: one subtle movement, no sound — a beat of reflection.
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            button.classList.add("is-arrived");
            io.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );
    io.observe(section);
  }

  // The final action: the product responds, and the conversation opens.
  button.addEventListener("click", () => {
    const alreadyOpen = section.getAttribute("data-state") === "pinged";
    playCue("response");
    haptic(16);
    section.setAttribute("data-state", "pinged");
    if (ping) ping.textContent = "The product responded. Now it's your move.";
    // First press reveals the ways to reach out; a second press opens email.
    if (alreadyOpen) {
      window.location.href = "mailto:anirudh.thata@gmail.com?subject=Let's build products together";
    }
  });
}
