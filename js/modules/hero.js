import { playCue, haptic } from "./sound.js";
import { getLenis } from "./smooth-scroll.js";

export function initHero() {
  const root = document.documentElement;
  const switchBtn = document.getElementById("hero-switch");
  if (!switchBtn) return;

  // A raw window.scrollTo while Lenis is running gets contested a frame
  // later, once Lenis's own loop resumes from whatever it last thought the
  // target was — go through it directly when it's active.
  const jumpTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  };

  const setLit = (lit) => {
    root.setAttribute("data-reveal", lit ? "on" : "off");
    switchBtn.setAttribute("aria-pressed", String(lit));
  };

  const reveal = () => {
    if (root.getAttribute("data-reveal") === "on") return;
    setLit(true);

    if ("scrollRestoration" in history) history.scrollRestoration = "auto";
    document.body.style.overflow = "";
    jumpTop();

    playCue("on");
    haptic(14);

    const title = document.getElementById("hero-title");
    if (title) {
      title.setAttribute("tabindex", "-1");
      window.setTimeout(() => { jumpTop(); title.focus({ preventScroll: true }); }, 420);
    }
  };

  // Arriving back from a case study: the head script already opened the light,
  // so step straight into the portfolio. Every other visit starts in the dark.
  if (root.classList.contains("skip-intro")) {
    setLit(true);
    const intro = document.getElementById("intro");
    if (intro) intro.hidden = true;
  } else {
    document.body.style.overflow = "hidden";
    setLit(false);
  }

  switchBtn.addEventListener("click", () => {
    const isOn = root.getAttribute("data-reveal") === "on";
    isOn ? setLit(false) : reveal();
  });
}
