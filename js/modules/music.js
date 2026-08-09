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
  // so we start a default vibe SYNCHRONOUSLY here (starting audio inside the
  // gesture is what satisfies strict autoplay policies — a delayed start can be
  // blocked). The visitor can then change it or switch it Off.
  const heroSwitch = document.getElementById("hero-switch");
  if (heroSwitch) {
    let autostarted = false;
    heroSwitch.addEventListener("click", () => {
      if (autostarted || current) return;
      autostarted = true;
      select("melody");
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
 * A warm, slowly-evolving CHORD PAD per vibe (the built-in fallback). Pure sine
 * voices spell soft jazz/ambient chords that crossfade every few seconds over a
 * gentle low-pass with slow filter movement — calm background music, not a
 * beeping melody. It is an original composition, NOT any copyrighted recording.
 * Drop a legally-provided track at assets/music/<vibe>.mp3 to use a real song.
 */
function makeMelody(id, ctx) {
  if (!ctx) return { stop() {} };
  if (ctx.state === "suspended") { try { ctx.resume(); } catch {} }
  const now = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.value = 0.0001;
  master.connect(ctx.destination);
  master.gain.exponentialRampToValueAtTime(0.5, now + 1.4); // slow, gentle fade-in

  // Mellow low-pass with slow movement so the pad breathes.
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1300;
  lp.Q.value = 0.2;
  lp.connect(master);
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.05; lfoGain.gain.value = 300;
  lfo.connect(lfoGain).connect(lp.frequency); lfo.start();

  // Soft chord progressions (Hz). Warm 7th chords that resolve gently.
  const PROG = {
    // Cmaj7 · Fmaj7 · Am7 · G  — calm, bright
    melody: [
      [130.81, 164.81, 196.0, 246.94],
      [174.61, 220.0, 261.63, 329.63],
      [220.0, 261.63, 329.63, 392.0],
      [196.0, 246.94, 293.66, 392.0],
    ],
    // Am7 · Fmaj7 · Cmaj7 · G  — wistful (vi–IV–I–V)
    emotion: [
      [220.0, 261.63, 329.63, 392.0],
      [174.61, 220.0, 261.63, 329.63],
      [130.81, 164.81, 196.0, 246.94],
      [196.0, 246.94, 293.66, 392.0],
    ],
    // Em7 · Cmaj7 · G · D  — a touch more movement
    rock: [
      [164.81, 196.0, 246.94, 293.66],
      [130.81, 164.81, 196.0, 246.94],
      [196.0, 246.94, 293.66, 392.0],
      [146.83, 185.0, 220.0, 293.66],
    ],
  };
  const prog = PROG[id] || PROG.melody;
  const chordDur = id === "rock" ? 2.8 : 3.8; // seconds per chord

  let idx = 0, stopped = false, timer = null, live = [];

  const release = (voice, t) => {
    try {
      voice.g.gain.cancelScheduledValues(t);
      voice.g.gain.setValueAtTime(voice.g.gain.value, t);
      voice.g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      voice.o.stop(t + 1.8);
    } catch {}
  };

  const playChord = () => {
    if (stopped) return;
    const freqs = prog[idx % prog.length];
    const t = ctx.currentTime;
    live.forEach((v) => release(v, t)); // crossfade out the previous chord
    live = [];
    freqs.forEach((f, k) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      o.detune.value = k === 0 ? 0 : 3; // a hair of width, not chorus-y
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.06, t + 1.0); // slow attack
      o.connect(g).connect(lp);
      o.start(t);
      live.push({ o, g });
    });
    idx += 1;
    timer = setTimeout(playChord, chordDur * 1000);
  };
  playChord();

  return {
    stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      const t = ctx.currentTime;
      try {
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(master.gain.value, t);
        master.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      } catch {}
      window.setTimeout(() => {
        live.forEach((v) => { try { v.o.stop(); } catch {} });
        try { lfo.stop(); } catch {}
      }, 700);
    },
  };
}
