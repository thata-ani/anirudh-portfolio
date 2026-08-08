/**
 * MUSIC / VIBE — the visitor personalises the experience.
 *
 * "What's your vibe?" → Melody · Rock · Emotion · Off. Choose one, switch
 * freely, or turn it off. Playback prefers real, high-quality tracks dropped
 * into assets/music/<vibe>.mp3; if none are present (e.g. in the preview) it
 * falls back to a restrained ambient bed so the interaction is fully working.
 * Volume stays low so it never competes with reading.
 */
import { haptic } from "./sound.js";

const TRACKS = { melody: "assets/music/melody.mp3", rock: "assets/music/rock.mp3", emotion: "assets/music/emotion.mp3" };
const VOL = 0.26;

export function initMusic() {
  const root = document.getElementById("vibe");
  if (!root) return;
  const toggle = document.getElementById("vibe-toggle");
  const label = document.getElementById("vibe-toggle-label");
  const chips = [...root.querySelectorAll("[data-vibe]")];

  let current = null;   // active vibe id or null
  let audioEl = null;   // real-track player
  let synth = null;     // fallback ambient
  let actx = null;

  const setOpen = (o) => { root.setAttribute("data-open", String(o)); toggle.setAttribute("aria-expanded", String(o)); };
  const setPlaying = (p) => root.setAttribute("data-playing", String(p));

  const stopAll = () => {
    if (audioEl) { try { audioEl.pause(); } catch {} audioEl = null; }
    if (synth) { synth.stop(); synth = null; }
  };

  const select = (id) => {
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.vibe === id)));
    if (id === "off" || id === null) {
      stopAll(); current = null; setPlaying(false);
      if (label) label.textContent = "What's your vibe?";
      return;
    }
    if (id === current) return;
    stopAll();
    current = id;
    setPlaying(true);
    if (label) label.textContent = id[0].toUpperCase() + id.slice(1);

    // Prefer a real track; fall back to the ambient bed if it can't load/play.
    let fellBack = false;
    const fallback = () => { if (!fellBack && current === id) { fellBack = true; synth = makeAmbient(id, () => (actx ||= makeCtx())); } };
    const el = new Audio(TRACKS[id]);
    el.loop = true; el.volume = 0; el.preload = "auto";
    el.addEventListener("error", fallback, { once: true });
    el.play().then(() => {
      if (current !== id) { el.pause(); return; }
      audioEl = el; fadeTo(el, VOL, 600);
    }).catch(fallback);
  };

  toggle.addEventListener("click", () => { haptic(8); setOpen(root.getAttribute("data-open") !== "true"); });
  chips.forEach((chip) =>
    chip.addEventListener("click", () => { haptic(10); select(chip.dataset.vibe); })
  );
  // Close the panel when clicking elsewhere.
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

function makeCtx() {
  const C = window.AudioContext || window.webkitAudioContext;
  return C ? new C() : null;
}

/**
 * A restrained ambient bed per vibe (fallback only). Sustained detuned pads
 * with a slow amplitude drift; "rock" adds a soft low pulse. Kept quiet.
 */
function makeAmbient(id, getCtx) {
  const ctx = getCtx();
  if (!ctx) return { stop() {} };
  if (ctx.state === "suspended") ctx.resume();
  const now = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.value = 0.0001;
  master.connect(ctx.destination);
  master.gain.exponentialRampToValueAtTime(0.14, now + 0.8);

  const chords = {
    melody: [261.63, 329.63, 392.0],       // C major
    emotion: [220.0, 261.63, 329.63],      // A minor
    rock: [130.81, 196.0, 261.63],         // C5 power-ish
  };
  const type = id === "rock" ? "sawtooth" : "sine";
  const nodes = [];

  // low-pass to keep it soft (esp. the sawtooth)
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = id === "rock" ? 700 : 1600;
  lp.connect(master);

  (chords[id] || chords.melody).forEach((f, i) => {
    [f, f * 1.005].forEach((freq) => { // slight detune for warmth
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = 0.18 / (i + 1);
      o.connect(g).connect(lp);
      o.start();
      nodes.push(o);
      // slow amplitude drift
      const lfo = ctx.createOscillator();
      const lg = ctx.createGain();
      lfo.frequency.value = 0.06 + i * 0.02;
      lg.gain.value = 0.06;
      lfo.connect(lg).connect(g.gain);
      lfo.start();
      nodes.push(lfo);
    });
  });

  // rock: a soft rhythmic pulse on the master
  let pulse = null;
  if (id === "rock") {
    pulse = ctx.createOscillator();
    const pg = ctx.createGain();
    pulse.type = "square";
    pulse.frequency.value = 1.6; // ~96 bpm feel
    pg.gain.value = 0.04;
    pulse.connect(pg).connect(master.gain);
    pulse.start();
    nodes.push(pulse);
  }

  return {
    stop() {
      const t = ctx.currentTime;
      try { master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.exponentialRampToValueAtTime(0.0001, t + 0.4); } catch {}
      setTimeout(() => nodes.forEach((n) => { try { n.stop(); } catch {} }), 460);
    },
  };
}
