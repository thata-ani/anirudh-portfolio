/**
 * CONNECTION — the final chapter, earned.
 *
 * The visitor has already experienced how Anirudh thinks. So the ending isn't a
 * contact form — it asks whether it resonated. First an appreciation (a
 * lightweight, real acknowledgment), then the earned final action: a real
 * conversation. Experienced → appreciated → connected.
 */
import { playCue, haptic } from "./sound.js";
import { sendLike, hasLiked } from "./analytics.js";

export function initContact() {
  const section = document.getElementById("contact");
  if (!section) return;
  const cta = document.getElementById("contact-cta");
  const ping = document.getElementById("contact-ping");
  const like = document.getElementById("appreciate-btn");

  // Arrival: one subtle settling beat.
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { section.classList.add("is-arrived"); io.disconnect(); } }),
      { threshold: 0.4 }
    );
    io.observe(section);
  }

  // A returning visitor who already appreciated sees that state preserved.
  if (like && hasLiked()) {
    section.setAttribute("data-state", "appreciated");
    like.setAttribute("aria-pressed", "true");
  }

  // Appreciation — meaningful, lightweight, recorded once per visitor.
  if (like) {
    like.addEventListener("click", () => {
      if (like.getAttribute("aria-pressed") === "true") return;
      like.setAttribute("aria-pressed", "true");
      section.setAttribute("data-state", "appreciated");
      playCue("on");
      haptic(12);
      sendLike();
    });
  }

  // The earned final action — a real conversation (mailto proceeds by default).
  if (cta) {
    cta.addEventListener("click", () => {
      playCue("response");
      haptic(16);
      if (ping) ping.textContent = "Opening your email — let's talk.";
    });
  }
}
