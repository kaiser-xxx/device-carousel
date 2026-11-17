/* Device Carousel: a scroll-driven carousel of isometric devices.
   Sibling of CD Carousel (github.com/kaiser-xxx/cd-carousel), same motion and inputs.

   One scroll gesture, swipe or arrow key moves one device along the diagonal. The centered
   device lifts a little, gets corner brackets and its details show top left. Clicking a side
   device brings it to the center; clicking the centered one calls openDevice(). On load the
   devices slide in along the path one by one. Animates transforms and opacity only. */
(function () {
const data = window.DEVICES || [];
const sec = document.querySelector(".dv-sec");
const root = sec && sec.querySelector(".dv-pin");
if (root && data.length) init();

function init() {
  const n = data.length;
  const pad = (k) => String(k).padStart(2, "0");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // TODO: go to the device's page (its href). Left empty on purpose for now.
  function openDevice(id) {}

  /* ---- render from data.js ---- */
  root.querySelector(".dv-stage").innerHTML = data.map((d) =>
    '<a class="dv" href="' + esc(d.href || "#") + '" aria-label="' + esc(d.name + ": " + d.title) + '" tabindex="-1">' +
    '<img src="' + esc(d.image) + '" alt="" draggable="false"></a>').join("");
  root.querySelector(".dv-items").innerHTML = data.map((d, i) =>
    '<li class="dv-item"><h3 class="dv-title">' + esc(d.title) + '</h3><dl class="dv-rows">' +
    (d.keywords || []).map((f) => '<div><dt class="mono">' + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd></div>").join("") +
    '</dl><a class="dv-open mono" href="' + esc(d.href || "#") + '">Open device ' + pad(i + 1) + "</a></li>").join("");
  root.querySelector(".dv-count").textContent = pad(n);
  sec.style.setProperty("--n", n);

  const devs = [...root.querySelectorAll(".dv")];
  const items = [...root.querySelectorAll(".dv-item")];
  const box = root.querySelector(".dv-box"); // one set of corner brackets above every device, below the details
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // each device's own centre in its image (from the image's opaque pixels), so the brackets sit right on it
  const mid = devs.map(() => [0, 0]);
  // brackets go where the centered device is: its slot, its lift and scale, and its own centre in the image
  function aim() {
    const m = mid[index], k = D * 1.8 * 1.05; // image size when centered
    root.style.setProperty("--bx", m[0] * k + "px");
    root.style.setProperty("--by", (mob ? midY : vh * 0.04) - D * 0.05 + m[1] * k + "px");
  }

  /* ---- layout ---- */
  let vw, vh, mob, D, secTop, step, midY = 0;
  function measure() {
    vw = innerWidth; vh = root.offsetHeight; mob = vw < 761;
    if (mob) { // phone: the device gets the space below the details, with room to breathe
      const top = Math.max(...items.map((el) => el.offsetTop + el.offsetHeight)) + 48;
      const bottom = vh - 72;
      D = Math.min(vw * 0.92, bottom - top);
      midY = (top + bottom) / 2 - vh / 2;
    } else D = Math.min(vw * 0.3, vh * 0.62);
    root.style.setProperty("--dv", D + "px"); // set once per resize, not per frame
    aim();
    secTop = sec.getBoundingClientRect().top + scrollY;
    step = Math.max(1, sec.offsetHeight - vh) / Math.max(1, n - 1);
  }

  // one straight isometric line: next device up and right, previous down and left, all the same size
  function place(t) {
    const a = Math.abs(t), fade = mob ? 1.7 : 2.6;
    const x = mob ? t * vw * 0.96 : t * D * 0.82;
    const y = mob ? midY - t * vh * 0.05 : vh * 0.04 - t * D * 0.57;
    return { x, y, o: a > fade ? Math.max(0, 1 - (a - fade) / 0.5) : 1 };
  }

  let index = 0, cur = 0, from = 0, to = 0, t0 = 0, raf = 0;
  const dur = reduce ? 1 : 950;
  let intro = 0, introAt = 0;
  const nudge = devs.map(() => ({ v: 0, to: 0 })); // hover: a side device slides a little along the path toward the centre
  const IN = 900, GAP = 90; // intro: each device takes IN ms to slide in, GAP ms after the one before it
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const out = (x) => 1 - Math.pow(1 - x, 3);

  let boxTimer = 0;
  function sync() {
    box.classList.remove("is-on"); // brackets let go of the old device and close in on the new one once it arrives
    clearTimeout(boxTimer);
    boxTimer = setTimeout(() => { aim(); box.classList.add("is-on"); }, cur === index ? 0 : 450);
    items.forEach((el, j) => el.classList.toggle("is-on", j === index)); // like CD: details follow the centered device
    devs.forEach((el, j) => { el.classList.toggle("is-on", j === index); el.tabIndex = j === index ? 0 : -1; });
  }

  function frame(now) {
    raf = 0;
    const p = Math.min(1, (now - t0) / dur);
    cur = from + (to - from) * ease(p);
    if (introAt) intro = now - introAt;
    let busy = p < 1 || (introAt && intro < IN + GAP * n);
    devs.forEach((el, i) => {
      // intro: one by one, from the centre outward, each device slides down the path from the top right into its spot
      const k = reduce ? 1 : introAt ? Math.max(0, Math.min(1, (intro - Math.abs(i - index) * GAP) / IN)) : 0;
      const nd = nudge[i];
      if (i === index) nd.to = 0;
      nd.v += (nd.to - nd.v) * 0.15;
      if (Math.abs(nd.to - nd.v) > 0.001) busy = true;
      const t = i - cur + (1 - out(k)) * 1.6 + nd.v;
      const q = place(t);
      const centered = Math.max(0, 1 - Math.abs(t)); // 1 when centered: lift a little
      el.style.transform = "translate3d(" + q.x.toFixed(1) + "px," + (q.y - centered * D * 0.05).toFixed(1) + "px,0) scale(" +
        (1 + 0.05 * centered).toFixed(4) + ")";
      el.style.opacity = (q.o * Math.min(1, k * 2.5)).toFixed(3);
      el.style.visibility = q.o <= 0 ? "hidden" : "visible";
    });
    if (busy) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }

  // the device in the middle follows the page position
  function onScroll() {
    const k = Math.max(0, Math.min(n - 1, Math.round((scrollY - secTop) / step)));
    if (k !== index) {
      index = k; from = cur; to = k; t0 = performance.now();
      sync();
    }
    kick();
  }

  /* ---- stepping: one gesture = one device ---- */
  let busyUntil = 0, lastT = 0, lastD = 0, gStart = 0;
  function go(k) { // jump the page to device k; the devices animate themselves
    k = Math.max(0, Math.min(n - 1, k));
    scrollTo({ top: Math.round(secTop + k * step), behavior: "instant" });
    busyUntil = performance.now() + (reduce ? 150 : 900);
  }
  // true when the gesture should move a device instead of the page
  function inside(dir) {
    const rel = scrollY - secTop, range = step * (n - 1);
    if (rel < -2 || rel > range + 2) return false; // section not pinned: scroll the page
    return dir > 0 ? index < n - 1 : index > 0;     // at the ends, let the page carry on
  }
  function move(dir) {
    if (performance.now() < busyUntil) return;
    go(index + dir);
  }
  // a trackpad flick fires dozens of wheel events with a decaying delta: one gesture, one step
  function onWheel(e) {
    const dir = Math.sign(e.deltaY);
    if (!dir || !inside(dir)) return;
    e.preventDefault();
    const now = e.timeStamp, d = Math.abs(e.deltaY);
    const fresh = now - gStart > 350 && (now - lastT > 400 || (d > lastD * 2.5 && d >= 10));
    lastT = now; lastD = d;
    if (fresh) { gStart = now; move(dir); }
  }
  let ty = null, held = false;
  function onTouchStart(e) { ty = e.touches[0].clientY; held = false; }
  function onTouchMove(e) {
    if (ty == null) return;
    const dy = ty - e.touches[0].clientY;
    if (!held && Math.abs(dy) < 8) return;
    if (!held && !inside(Math.sign(dy))) { ty = null; return; } // not ours: native scroll
    held = true;
    e.preventDefault();
    if (Math.abs(dy) > 30) { move(Math.sign(dy)); ty = null; }
  }
  const KEYS = { ArrowDown: 1, PageDown: 1, ArrowRight: 1, ArrowUp: -1, PageUp: -1, ArrowLeft: -1 };
  function onKey(e) {
    const dir = KEYS[e.key];
    if (!dir || /input|textarea|select/i.test(e.target.tagName) || !inside(dir)) return;
    e.preventDefault();
    move(dir);
  }

  // hover (mouse only): a side device nudges toward the centre. click: a side device comes to the center, the centered one opens
  const hover = matchMedia("(hover: hover) and (pointer: fine)").matches && !reduce;
  devs.forEach((el, i) => {
    if (hover) {
      el.addEventListener("pointerenter", () => { if (i !== index) { nudge[i].to = Math.sign(index - i) * 0.05; kick(); } });
      el.addEventListener("pointerleave", () => { nudge[i].to = 0; kick(); });
    }
    el.addEventListener("click", (e) => {
      e.preventDefault();
      if (i === index) openDevice(data[i].id); else go(i);
    });
  });
  items.forEach((el, i) => {
    el.querySelector(".dv-open").addEventListener("click", (e) => { e.preventDefault(); openDevice(data[i].id); });
  });

  devs.forEach((el, i) => {
    const img = el.querySelector("img");
    const fit = () => {
      const S = 100, c = document.createElement("canvas");
      c.width = c.height = S;
      const g = c.getContext("2d");
      g.drawImage(img, 0, 0, S, S);
      const px = g.getImageData(0, 0, S, S).data;
      let x0 = S, y0 = S, x1 = 0, y1 = 0;
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (px[(y * S + x) * 4 + 3] > 128) {
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
      if (x1 < x0) return;
      mid[i] = [(x0 + x1 + 1) / 2 / S - 0.3889, (y0 + y1 + 1) / 2 / S - 0.3889]; // 0.3889 = centre of the device box in the image
      if (D) aim();
    };
    if (img.complete) fit(); else img.addEventListener("load", fit);
  });

  function onResize() { measure(); onScroll(); }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onResize);
  addEventListener("wheel", onWheel, { passive: false });
  addEventListener("touchstart", onTouchStart, { passive: true });
  addEventListener("touchmove", onTouchMove, { passive: false });
  addEventListener("keydown", onKey);
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  measure(); sync(); onScroll();
  requestAnimationFrame(() => requestAnimationFrame(() => { // after first paint, so the devices slide in first and the details and brackets fade in after
    root.classList.add("dv-in");
    if (!reduce) introAt = performance.now();
    kick();
    if (document.fonts) document.fonts.ready.then(onResize); // the details block grows once the fonts land
  }));
}
})();
