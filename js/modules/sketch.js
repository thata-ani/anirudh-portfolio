/**
 * SKETCH PAD — a designer's workspace inside "My Process".
 *
 * A small graph-paper canvas the visitor can actually draw on: choose a tool
 * (pencil / pen / marker) and an ink, and make a mark. It makes the section's
 * idea tactile — thinking → exploring → making → refining begins on the page,
 * before the screen. Monochrome ink keeps it on-theme.
 */
const PENS = {
  pencil: { width: 1.6, alpha: 0.72 },
  pen: { width: 2.6, alpha: 1 },
  marker: { width: 13, alpha: 0.22 },
};

export function initSketch() {
  const canvas = document.getElementById("sketch-pad");
  const fig = canvas ? canvas.closest(".sketch") : null;
  if (!canvas || !fig) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let pen = "pencil";
  let ink = "#0b0b0c";
  let drawing = false;
  let lastX = 0, lastY = 0;
  let dpr = 1;

  const fit = () => {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    // preserve the current drawing across a resize
    const prev = document.createElement("canvas");
    prev.width = canvas.width; prev.height = canvas.height;
    if (canvas.width) prev.getContext("2d").drawImage(canvas, 0, 0);
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    if (prev.width) ctx.drawImage(prev, 0, 0, prev.width, prev.height, 0, 0, r.width, r.height);
  };
  fit();
  window.addEventListener("resize", fit, { passive: true });

  const applyStyle = () => {
    const p = PENS[pen] || PENS.pencil;
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    ctx.lineWidth = p.width;
    ctx.globalAlpha = p.alpha;
  };

  const pos = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const down = (e) => {
    drawing = true;
    applyStyle();
    const { x, y } = pos(e);
    lastX = x; lastY = y;
    // a single tap still leaves a mark
    ctx.beginPath();
    ctx.arc(x, y, (PENS[pen].width) / 2, 0, Math.PI * 2);
    ctx.fill();
    try { canvas.setPointerCapture(e.pointerId); } catch {}
  };
  const move = (e) => {
    if (!drawing) return;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastX = x; lastY = y;
  };
  const up = () => { drawing = false; };

  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);

  // Tools
  const tools = [...fig.querySelectorAll(".sketch__tool")];
  tools.forEach((btn) =>
    btn.addEventListener("click", () => {
      pen = btn.dataset.pen;
      tools.forEach((b) => { const on = b === btn; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", String(on)); });
    })
  );
  const inks = [...fig.querySelectorAll(".sketch__ink")];
  inks.forEach((btn) =>
    btn.addEventListener("click", () => {
      ink = btn.dataset.ink;
      inks.forEach((b) => { const on = b === btn; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", String(on)); });
    })
  );
  const clear = fig.querySelector("[data-sketch-clear]");
  if (clear) clear.addEventListener("click", () => {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  });
}
