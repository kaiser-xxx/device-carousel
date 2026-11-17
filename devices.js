/* Device Carousel: a scroll-driven carousel of isometric devices.
   Sibling of CD Carousel (github.com/kaiser-xxx/cd-carousel), same motion and inputs.

   One scroll gesture, swipe or arrow key moves one device along the diagonal. The centered
   device lifts a little, gets corner brackets and its details show top left. Clicking a side
   device brings it to the center; clicking the centered one calls openDevice(). The first
   device turns in on load. Animates transforms and opacity only. */
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
    root.style.setProperty("--by", (mob ? midY : vh * 0.04) + "px"); // where the centered device sits
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
  let intro = reduce ? 1 : 0, introAt = 0;
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const out = (x) => 1 - Math.pow(1 - x, 3);

  let boxTimer = 0;
  function sync() {
    box.classList.remove("is-on"); // brackets let go of the old device and close in on the new one once it arrives
    clearTimeout(boxTimer);
    boxTimer = setTimeout(() => box.classList.add("is-on"), cur === index ? 0 : 450);
    items.forEach((el, j) => el.classList.toggle("is-on", j === index)); // like CD: details follow the centered device
    devs.forEach((el, j) => { el.classList.toggle("is-on", j === index); el.tabIndex = j === index ? 0 : -1; });
  }

  function frame(now) {
    raf = 0;
    const p = Math.min(1, (now - t0) / dur);
    cur = from + (to - from) * ease(p);
    if (introAt && !reduce) intro = Math.min(1, (now - introAt) / 1500);
    let busy = p < 1 || (introAt && intro < 1);
    devs.forEach((el, i) => {
      // during the intro the neighbours wait off-screen top right, then glide in
      const lag = i === index ? 0 : 1 - out(Math.max(0, Math.min(1, (intro - 0.35 - Math.abs(i - index) * 0.1) / 0.55)));
      const t = i - cur + lag * 2.2 * (i < index ? -1 : 1);
      const q = place(t);
      const centered = Math.max(0, 1 - Math.abs(t)); // 1 when centered: lift a little
      const turn = i === index ? (1 - out(intro)) * 88 : 0; // the first device turns from edge-on to face you
      el.style.transform = "translate3d(" + q.x.toFixed(1) + "px," + (q.y - centered * D * 0.05).toFixed(1) + "px,0) scale(" +
        (1 + 0.05 * centered).toFixed(4) + ") rotateY(" + turn.toFixed(2) + "deg)";
      el.style.opacity = (q.o * (i === index ? Math.min(1, intro * 3 + 0.2) : 1)).toFixed(3);
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

  // click: a side device comes to the center, the centered one opens
  devs.forEach((el, i) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      if (i === index) openDevice(data[i].id); else go(i);
    });
  });
  items.forEach((el, i) => {
    el.querySelector(".dv-open").addEventListener("click", (e) => { e.preventDefault(); openDevice(data[i].id); });
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
  requestAnimationFrame(() => requestAnimationFrame(() => { // after first paint, so the device turns in first and the details and brackets fade in after
    root.classList.add("dv-in");
    if (!reduce) introAt = performance.now();
    kick();
    if (document.fonts) document.fonts.ready.then(onResize); // the details block grows once the fonts land
  }));
}
})();
