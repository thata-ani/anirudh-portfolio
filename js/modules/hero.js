import { playCue, haptic } from "./sound.js";

export function initHero() {
  const root = document.documentElement;
  const switchBtn = document.getElementById("hero-switch");
  if (!switchBtn) return;

  const setLit = (lit) => {
    root.setAttribute("data-reveal", lit ? "on" : "off");
    switchBtn.setAttribute("aria-pressed", String(lit));
  };

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  document.body.style.overflow = "hidden";
  setLit(false);

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

  switchBtn.addEventListener("click", () => {
    const isOn = root.getAttribute("data-reveal") === "on";
    isOn ? setLit(false) : reveal();
  });
}
