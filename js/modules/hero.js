import { playCue, haptic } from "./sound.js";

export function initHero() {
  const root = document.documentElement;
  const switchBtn = document.getElementById("hero-switch");
  if (!switchBtn) return;

  const setLit = (lit) => {
    root.setAttribute("data-reveal", lit ? "on" : "off");
    switchBtn.setAttribute("aria-pressed", String(lit));
  };

  const reveal = () => {
    if (root.getAttribute("data-reveal") === "on") return;
    setLit(true);

    if ("scrollRestoration" in history) history.scrollRestoration = "auto";
    document.body.style.overflow = "";
    window.scrollTo(0, 0);

    playCue("on");
    haptic(14);

    const title = document.getElementById("hero-title");
    if (title) {
      title.setAttribute("tabindex", "-1");
      window.setTimeout(() => { window.scrollTo(0, 0); title.focus({ preventScroll: true }); }, 420);
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
