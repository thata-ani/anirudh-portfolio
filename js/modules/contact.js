/**
 * CONTACT — Principle: Connection.
 *
 * Pressing "Get in Touch" plays a single subtle, premium notification tone —
 * never loud, never playful — then surfaces the invitation to actually talk.
 * Every opportunity starts with a conversation; the sound is that conversation
 * beginning. Audio is synthesised (Web Audio) so there is no asset to load and
 * it can only ever play in response to a real user gesture.
 */
export function initContact() {
  const section = document.getElementById("contact");
  const button = document.getElementById("contact-cta");
  const ping = document.getElementById("contact-ping");
  if (!section || !button) return;

  const EMAIL = "anirudh.thata@gmail.com";
  let audioCtx = null;

  /** A calm two-note interval with a soft bell envelope. Peak gain kept low. */
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

      // Two soft partials, a perfect fifth apart — warm, not chirpy.
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
        gain.gain.exponentialRampToValueAtTime(peak, start + 0.02); // gentle attack
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.1); // long soft tail

        osc.connect(gain).connect(master);
        osc.start(start);
        osc.stop(start + 1.2);
      });

      master.gain.exponentialRampToValueAtTime(0.5, now + 0.02);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);
    } catch {
      /* Audio is an enhancement — never block the actual contact action. */
    }
  };

  button.addEventListener("click", () => {
    playChime();

    section.setAttribute("data-state", "pinged");
    if (ping) ping.textContent = "That's the sound of a conversation starting. Let's talk →";

    // Let the tone land, then open the real conversation.
    window.setTimeout(() => {
      window.location.href = `mailto:${EMAIL}?subject=Let's build products together`;
    }, 700);
  });
}
