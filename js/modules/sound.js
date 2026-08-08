/**
 * Product feedback sound — action → system response.
 *
 * Shared, synthesised (Web Audio) so there's no asset and it only ever plays in
 * response to a real interaction. Two short, premium cues:
 *   · "on"       — the product powers on (hero reveal)
 *   · "response" — the product answers one last time (final CTA)
 * Never ambient, never a soundtrack.
 */
let ctx = null;

const audio = () => {
  const C = window.AudioContext || window.webkitAudioContext;
  if (!C) return null;
  if (!ctx) ctx = new C();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

const CUES = {
  // a rising three-note "power on"
  on: [
    { f: 392.0, d: 0, p: 0.05 },
    { f: 587.33, d: 0.08, p: 0.08 },
    { f: 880.0, d: 0.17, p: 0.05 },
  ],
  // a two-note confirming "response"
  response: [
    { f: 659.25, d: 0, p: 0.07 },
    { f: 987.77, d: 0.1, p: 0.05 },
  ],
};

export function playCue(kind = "on") {
  const c = audio();
  if (!c) return;
  const notes = CUES[kind] || CUES.on;
  try {
    const now = c.currentTime;
    const master = c.createGain();
    master.gain.value = 0.0001;
    master.connect(c.destination);
    notes.forEach(({ f, d, p }) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      const s = now + d;
      gain.gain.setValueAtTime(0.0001, s);
      gain.gain.exponentialRampToValueAtTime(p, s + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, s + 1.0);
      osc.connect(gain).connect(master);
      osc.start(s);
      osc.stop(s + 1.1);
    });
    master.gain.exponentialRampToValueAtTime(0.5, now + 0.02);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);
  } catch {
    /* audio is enhancement only */
  }
}

export function haptic(ms) {
  if (navigator.vibrate) {
    try {
      navigator.vibrate(ms);
    } catch {
      /* unsupported */
    }
  }
}
