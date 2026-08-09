/**
 * MUSIC / VIBE — a portfolio interaction that starts sound. Not a player.
 *
 * "What's your vibe?" → Melody · Rock · Emotion · Off. Playback prefers real,
 * high-quality tracks dropped into assets/music/<vibe>.mp3 (none are bundled —
 * only add tracks that are legally provided); if none load it falls back to a
 * restrained ambient bed so the interaction always works.
 *
 * The important fix: the AudioContext is unlocked *synchronously* on the click
 * gesture (before any async track load), otherwise strict autoplay policies
 * leave it suspended and nothing is ever heard.
 */
import { haptic } from "./sound.js";

const TRACKS = {
  melody: "assets/music/melody.mp3",
  rock: "assets/music/rock.mp3",
  emotion: "assets/music/emotion.mp3",
};
const VOL = 0.28;

export function initMusic() {
  const root = document.getElementById("vibe");
  if (!root) return;
  const toggle = document.getElementById("vibe-toggle");
  const label = document.getElementById("vibe-toggle-label");
  const chips = [...root.querySelectorAll("[data-vibe]")];

  let current = null;   // active vibe id or null
  let audioEl = null;   // real-track player
  let synth = null;     // fallback ambient
  let actx = null;      // shared AudioContext

  const makeCtx = () => {
    const C = window.AudioContext || window.webkitAudioContext;
    return C ? new C() : null;
  };
  // Create + resume the context inside the user gesture. This is what makes
  // the fallback actually audible under autoplay restrictions.
  const unlock = () => {
    if (!actx) actx = makeCtx();
    if (actx && actx.state === "suspended") { try { actx.resume(); } catch {} }
    return actx;
  };

  const setOpen = (o) => { root.setAttribute("data-open", String(o)); toggle.setAttribute("aria-expanded", String(o)); };
  const setPlaying = (p) => root.setAttribute("data-playing", String(p));

  const stopAll = () => {
    if (audioEl) { try { audioEl.pause(); } catch {} audioEl = null; }
    if (synth) { synth.stop(); synth = null; }
  };

  const select = (id) => {
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.vibe === id)));
    if (id === "off" || id == null) {
      stopAll(); current = null; setPlaying(false);
      if (label) label.textContent = "What's your vibe?";
      return;
    }
    if (id === current) return;
    stopAll();
    current = id;
    setPlaying(true);
    if (label) label.textContent = id[0].toUpperCase() + id.slice(1);

    const ctx = unlock(); // already resumed within the gesture

    // Start audible music IMMEDIATELY, inside the gesture — this guarantees
    // sound even under strict autoplay policies. If a real, legally-provided
    // track exists at assets/music/<vibe>.mp3 it upgrades to that and the synth
    // steps aside; otherwise the melodic synth keeps playing.
    synth = makeMelody(id, ctx);

    const el = new Audio(TRACKS[id]);
    el.loop = true; el.volume = 0; el.preload = "auto";
    el.play().then(() => {
      if (current !== id) { el.pause(); return; }
      if (synth) { synth.stop(); synth = null; } // real track wins
      audioEl = el; fadeTo(el, VOL, 600);
    }).catch(() => {}); // no track → keep the synth melody
  };

  toggle.addEventListener("click", () => {
    unlock(); haptic(8);
    setOpen(root.getAttribute("data-open") !== "true");
  });
  chips.forEach((chip) =>
    chip.addEventListener("click", () => { unlock(); haptic(10); select(chip.dataset.vibe); })
  );
  document.addEventListener("click", (e) => { if (!root.contains(e.target)) setOpen(false); });

  // Turn on the light → music begins. The reveal click is a real user gesture,
  // so we unlock the audio synchronously here and start a default vibe a beat
  // later (after the power-on cue). The visitor can change it or switch it Off.
  const heroSwitch = document.getElementById("hero-switch");
  if (heroSwitch) {
    let autostarted = false;
    heroSwitch.addEventListener("click", () => {
      if (autostarted) return;
      autostarted = true;
      unlock(); // resume the context within the gesture; the synth can start later
      window.setTimeout(() => { if (!current) select("melody"); }, 600);
    });
  }
}

/* ---- helpers ------------------------------------------------------------ */
function fadeTo(el, target, ms) {
  let v = el.volume;
  const step = (target - v) / (ms / 16);
  const t = setInterval(() => {
    v += step;
    if ((step > 0 && v >= target) || (step < 0 && v <= target)) { v = target; clearInterval(t); }
    try { el.volume = Math.min(1, Math.max(0, v)); } catch { clearInterval(t); }
  }, 16);
}

/**
 * A calm, warm, looping ORIGINAL melody per vibe (the built-in fallback). Soft
 * sine/triangle voices only — no harsh saw/square — with gentle attacks, notes
 * that overlap into a legato line, a mellow low-pass and a light delay for air.
 * Meant to feel like quiet background music, not a synth test tone. It is an
 * original composition, NOT any copyrighted recording. Drop a legally-provided
 * track at assets/music/<vibe>.mp3 to use a real song instead.
 */
function makeMelody(id, ctx) {
  if (!ctx) return { stop() {} };
  if (ctx.state === "suspended") { try { ctx.resume(); } catch {} }
  const now = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.value = 0.0001;
  master.connect(ctx.destination);
  const peak = id === "rock" ? 0.5 : 0.42; // gentle overall level
  master.gain.exponentialRampToValueAtTime(peak, now + 1.2);

  // Mellow low-pass so nothing is bright or harsh.
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = id === "rock" ? 1900 : 1500;
  lp.Q.value = 0.3;
  lp.connect(master);

  // A light, low-feedback delay for air (not a wash).
  const delay = ctx.createDelay(1.0);
  delay.delayTime.value = 0.3;
  const fb = ctx.createGain(); fb.gain.value = 0.16;
  const wet = ctx.createGain(); wet.gain.value = 0.16;
  lp.connect(delay); delay.connect(fb).connect(delay); delay.connect(wet).connect(master);

  // Smooth, mostly-stepwise pentatonic phrases — easy on the ear.
  const SEQ = {
    melody:  [523.25, 587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33],
    emotion: [440.0, 523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25],
    rock:    [329.63, 392.0, 440.0, 493.88, 587.33, 493.88, 440.0, 392.0],
  };
  const seq = SEQ[id] || SEQ.melody;
  const step = id === "emotion" ? 0.72 : id === "rock" ? 0.44 : 0.6; // seconds/note

  // Soft low pad (root + fifth) for warmth.
  const padNotes = id === "emotion" ? [220.0, 329.63] : id === "rock" ? [196.0, 293.66] : [261.63, 392.0];
  const drones = [];
  padNotes.forEach((f) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "sine"; o.frequency.value = f; g.gain.value = 0.05;
    o.connect(g).connect(lp); o.start(); drones.push(o);
  });

  let i = 0, stopped = false, timer = null;
  const playNote = () => {
    if (stopped) return;
    const f = seq[i % seq.length];
    const t = ctx.currentTime;
    const ring = step * 1.8; // notes overlap → a connected, legato line
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "triangle"; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.14, t + 0.09); // soft, rounded attack
    g.gain.exponentialRampToValueAtTime(0.0001, t + ring); // long gentle decay
    o.connect(g).connect(lp);
    o.start(t); o.stop(t + ring + 0.05);
    i += 1;
    timer = setTimeout(playNote, step * 1000);
  };
  playNote();

  return {
    stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      const t = ctx.currentTime;
      try {
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(master.gain.value, t);
        master.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      } catch {}
      setTimeout(() => drones.forEach((n) => { try { n.stop(); } catch {} }), 560);
    },
  };
}
