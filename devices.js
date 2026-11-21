/* Device Carousel, wheel version.

   The devices sit on a big wheel; only the one in the brackets is on screen. One scroll gesture,
   swipe or arrow key turns the wheel one step and the next device rolls into the frame. Its details
   show top left. Clicking a side device turns it into the frame; clicking the framed one calls
   openDevice(). Each device turns with a CSS transition on its own transform, so the motion runs
   off the main thread and never stutters. */
(function () {
const data = window.DEVICES || [];
const sec = document.querySelector(".dv-sec");
const root = sec && sec.querySelector(".dv-pin");
if (root && data.length) init();

function init() {
  const n = data.length;
  const pad = (k) => String(k).padStart(2, "0");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // TODO: go to the case study (its href). Left empty on purpose for now.
  function openDevice(id) {}

  /* ---- render from data.js ---- */
  root.querySelector(".dv-stage").innerHTML = data.map((d, i) =>
    '<a class="dv' + (d.wip ? " is-wip" : "") + '" style="--i:' + i + '" href="' + esc(d.href || "#") + '" aria-label="' + esc(d.name + ": " + d.title) + '" tabindex="-1">' +
    '<img src="' + esc(d.image) + '" alt="" draggable="false"></a>').join("");
  root.querySelector(".dv-items").innerHTML = data.map((d, i) =>
    '<li class="dv-item"><h3 class="dv-title">' + esc(d.title) + '</h3><dl class="dv-rows">' +
    (d.keywords || []).map((f) => '<div><dt class="mono">' + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd></div>").join("") +
    "</dl>" + (d.wip ? '<span class="dv-open dv-soon mono">Coming soon</span>' : '<a class="dv-open mono" href="' + esc(d.href || "#") + '">Open case study ' + pad(i + 1) + "</a>") + "</li>").join("");
  root.querySelector(".dv-count").textContent = pad(n);
  sec.style.setProperty("--n", n);

  const devs = [...root.querySelectorAll(".dv")];
  const items = [...root.querySelectorAll(".dv-item")];
  const box = root.querySelector(".dv-box");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- layout: device size D, wheel radius R, frame centre ---- */
  let D, secTop, step;
  function measure() {
    const vw = innerWidth, vh = root.offsetHeight;
    let cy;
    if (vw < 761) { // phone: the frame gets the space below the details, with room to breathe
      const top = Math.max(...items.map((el) => el.offsetTop + el.offsetHeight)) + 40;
      const bottom = vh - 64;
      D = Math.min(vw * 0.72, (bottom - top) * 0.82);
      cy = (top + bottom) / 2 - vh / 2;
    } else {
      D = Math.min(vw * 0.32, vh * 0.5);
      cy = vh * 0.04;
    }
    root.style.setProperty("--dv", D + "px");
    root.style.setProperty("--cy", cy + "px");
    root.style.setProperty("--r", vw + D * 3 + "px"); // big enough that the neighbours (30° away) sit fully off screen
    secTop = sec.getBoundingClientRect().top + scrollY;
    step = Math.max(1, sec.offsetHeight - vh) / Math.max(1, n - 1);
  }

  /* ---- state: index = device in the frame ---- */
  let index = 0, boxTimer = 0;
  function sync() {
    root.style.setProperty("--k", index); // every device turns to (its place - index) × 30°
    items.forEach((el, j) => el.classList.toggle("is-on", j === index));
    devs.forEach((el, j) => { el.classList.toggle("is-on", j === index); el.tabIndex = j === index ? 0 : -1; });
    box.classList.remove("is-on"); // brackets let go and close in again once the next device has arrived
    clearTimeout(boxTimer);
    boxTimer = setTimeout(() => box.classList.add("is-on"), reduce ? 0 : 650);
  }

  // the device in the frame follows the page position
  function onScroll() {
    const k = Math.max(0, Math.min(n - 1, Math.round((scrollY - secTop) / step)));
    if (k !== index) { index = k; sync(); }
  }

  /* ---- stepping: one gesture = one device ---- */
  let busyUntil = 0, lastT = 0, lastD = 0, gStart = 0;
  function go(k) { // jump the page to device k; the wheel turns itself
    k = Math.max(0, Math.min(n - 1, k));
    scrollTo({ top: Math.round(secTop + k * step), behavior: "instant" });
    busyUntil = performance.now() + (reduce ? 150 : 900);
  }
  // true when the gesture should turn the wheel instead of scrolling the page
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

  // click: a side device turns into the frame; the framed one opens (unless it's not ready yet)
  devs.forEach((el, i) => el.addEventListener("click", (e) => {
    e.preventDefault();
    if (i !== index) go(i);
    else if (!data[i].wip) openDevice(data[i].id);
  }));
  items.forEach((el, i) => {
    const a = el.querySelector("a.dv-open");
    if (a) a.addEventListener("click", (e) => { e.preventDefault(); openDevice(data[i].id); });
  });

  function onResize() { measure(); onScroll(); }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onResize);
  addEventListener("wheel", onWheel, { passive: false });
  addEventListener("touchstart", onTouchStart, { passive: true });
  addEventListener("touchmove", onTouchMove, { passive: false });
  addEventListener("keydown", onKey);
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  measure(); onScroll(); sync();
  root.style.setProperty("--k", -1); // intro: the wheel starts one step back and turns the first device into the frame
  requestAnimationFrame(() => requestAnimationFrame(() => {
    root.classList.add("dv-in");
    root.style.setProperty("--k", index);
    if (document.fonts) document.fonts.ready.then(onResize); // the details block grows once the fonts land
  }));
}
})();
