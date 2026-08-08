/**
 * CONTACT — Principle: Connection.
 *
 * On entering the section: the Get in Touch button performs one subtle movement,
 * a single premium notification tone plays, and supported devices get a light
 * haptic. Pressing the button replays the tone and opens the conversation.
 * Every opportunity starts with a conversation — the sound is that beginning.
 * Audio is synthesised (Web Audio); it can only play if the browser's autoplay
 * policy allows it (typically true once the visitor has interacted with the
 * page — e.g. pulled the cord), and never blocks the actual contact action.
 */
export function initContact() {
  const section = document.getElementById("contact");
  const button = document.getElementById("contact-cta");
  const ping = document.getElementById("contact-ping");
  if (!section || !button) return;

  const EMAIL = "anirudh.thata@gmail.com";
  let audioCtx = null;

  const playChime = () => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try {
      audioCtx = audioCtx || new Ctx();
      if (audioCtx.state === "suspended") audioCtx.resume();
      const now = audioCtx.currentTime;
      const master = audioCtx.createGain();
      master.gain.value = 0.0001;
      master.connect(audioCtx.destination);
      [
        { freq: 587.33, delay: 0, peak: 0.09 }, // D5
        { freq: 880.0, delay: 0.09, peak: 0.06 }, // A5
      ].forEach(({ freq, delay, peak }) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const start = now + delay;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.1);
        osc.connect(gain).connect(master);
        osc.start(start);
        osc.stop(start + 1.2);
      });
      master.gain.exponentialRampToValueAtTime(0.5, now + 0.02);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);
    } catch {
      /* enhancement only */
    }
  };

  const haptic = (ms) => {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch {
        /* unsupported */
      }
    }
  };

  // On entering the section — one subtle movement, one tone, one light haptic.
  let arrived = false;
  const arrive = () => {
    if (arrived) return;
    arrived = true;
    section.setAttribute("data-state", "pinged");
    button.classList.add("is-arrived");
    if (ping) ping.textContent = "Every opportunity starts with a conversation.";
    playChime();
    haptic(18);
  };
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            arrive();
            io.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );
    io.observe(section);
  }

  button.addEventListener("click", () => {
    playChime();
    haptic(12);
    section.setAttribute("data-state", "pinged");
    if (ping) ping.textContent = "That's the sound of a conversation starting. Let's talk →";
    window.setTimeout(() => {
      window.location.href = `mailto:${EMAIL}?subject=Let's build products together`;
    }, 650);
  });
}
