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
 * A clearly-audible, looping ORIGINAL melody per vibe (the built-in fallback).
 * A plucked lead plays a pentatonic/raga-flavoured phrase over a soft pad, with
 * a warm delay for space — melodic and recognizable, not a drone. This is an
 * original composition inspired by that style; it is NOT any copyrighted
 * recording. Drop a legally-provided track at assets/music/<vibe>.mp3 to use a
 * real song instead. Uses the already-unlocked context so it plays at once.
 */
function makeMelody(id, ctx) {
  if (!ctx) return { stop() {} };
  if (ctx.state === "suspended") { try { ctx.resume(); } catch {} }
  const now = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.value = 0.0001;
  master.connect(ctx.destination);
  const peak = id === "rock" ? 0.36 : 0.32;
  master.gain.exponentialRampToValueAtTime(peak, now + 0.5);

  // A soft feedback delay — warmth and space.
  const delay = ctx.createDelay(1.0);
  delay.delayTime.value = id === "emotion" ? 0.36 : 0.26;
  const fb = ctx.createGain(); fb.gain.value = 0.3;
  const wet = ctx.createGain(); wet.gain.value = 0.34;
  delay.connect(fb).connect(delay);
  delay.connect(wet).connect(master);

  // Warm lead through a lowpass; also feeds the delay.
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass"; lp.frequency.value = id === "rock" ? 2800 : 2100;
  lp.connect(master); lp.connect(delay);

  // Looping melodic phrases (Hz). Pentatonic / raga-flavoured, in order.
  const SEQ = {
    melody:  [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 659.25, 783.99, 880.0, 783.99, 659.25],
    emotion: [440.0, 523.25, 587.33, 523.25, 493.88, 440.0, 392.0, 440.0, 523.25, 493.88, 440.0, 392.0],
    rock:    [329.63, 392.0, 440.0, 523.25, 440.0, 392.0, 329.63, 440.0, 523.25, 587.33, 523.25, 440.0],
  };
  const seq = SEQ[id] || SEQ.melody;
  const step = id === "emotion" ? 0.5 : id === "rock" ? 0.3 : 0.38; // seconds/note
  const leadType = id === "rock" ? "sawtooth" : "triangle";

  // A low sustained pad for body.
  const padNotes = id === "emotion" ? [220.0, 329.63] : id === "rock" ? [130.81, 196.0] : [261.63, 392.0];
  const drones = [];
  padNotes.forEach((f) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "sine"; o.frequency.value = f; g.gain.value = 0.09;
    o.connect(g).connect(master); o.start(); drones.push(o);
  });
  if (id === "rock") { // steady low pulse
    const p = ctx.createOscillator(); const pg = ctx.createGain();
    p.type = "square"; p.frequency.value = 2; pg.gain.value = 0.04;
    p.connect(pg).connect(master.gain); p.start(); drones.push(p);
  }

  let i = 0, stopped = false, timer = null;
  const playNote = () => {
    if (stopped) return;
    const f = seq[i % seq.length];
    const t = ctx.currentTime;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = leadType; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.24, t + 0.02);   // pluck attack
    g.gain.exponentialRampToValueAtTime(0.0001, t + step * 0.95); // decay
    o.connect(g).connect(lp);
    o.start(t); o.stop(t + step);
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
        master.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      } catch {}
      setTimeout(() => drones.forEach((n) => { try { n.stop(); } catch {} }), 460);
    },
  };
}
