/* Device Carousel: a scroll-driven carousel of isometric devices.
   Sibling of CD Carousel (github.com/kaiser-xxx/cd-carousel), same motion and inputs.

   One scroll gesture, swipe or arrow key moves one device along the diagonal. The centered
   device lifts, gets corner brackets and its details show top left. Clicking a side device
   brings it to the center; clicking the centered one calls openDevice(). Past the first or
   last device the page scrolls normally. Animates transforms and opacity only. */
(function () {
  var data = window.DEVICES || [];
  var sec = document.querySelector(".dv-sec");
  var root = sec && sec.querySelector(".dv-pin");
  if (!root || !data.length) return;
  var n = data.length;
  var pad = function (k) { return String(k).padStart(2, "0"); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  // TODO: go to the device's page (its href). Left empty on purpose for now.
  function openDevice(id) {}

  /* ---- render from data.js ---- */
  root.querySelector(".dv-stage").innerHTML = data.map(function (d) {
    return '<a class="dv" href="' + esc(d.href || "#") + '" aria-label="' + esc(d.name + ": " + d.title) + '" tabindex="-1">' +
      '<img src="' + esc(d.image) + '" alt="" draggable="false"></a>';
  }).join("");
  root.querySelector(".dv-items").innerHTML = data.map(function (d, i) {
    return '<li class="dv-item"><h3 class="dv-title">' + esc(d.title) + '</h3><dl class="dv-rows">' +
      (d.keywords || []).map(function (f) { return '<div><dt class="mono">' + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd></div>"; }).join("") +
      '</dl><a class="dv-open mono" href="' + esc(d.href || "#") + '">Open device ' + pad(i + 1) + "</a></li>";
  }).join("");
  root.querySelector(".dv-count").textContent = pad(n);
  sec.style.setProperty("--n", n);

  var devs = [].slice.call(root.querySelectorAll(".dv"));
  var items = [].slice.call(root.querySelectorAll(".dv-item"));
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // corner brackets round the centered device: one size for all, centered on the device once its image loads
  var mid = devs.map(function () { return [0, 0]; }); // device's own center vs its image center, in units of D
  devs.forEach(function (d, i) {
    d.insertAdjacentHTML("beforeend", '<span class="dv-box" aria-hidden="true"><i></i><i></i><i></i><i></i></span>');
    var img = d.querySelector("img"), box = d.lastChild;
    function fit() {
      var c = document.createElement("canvas"), S = 100;
      c.width = c.height = S;
      var g = c.getContext("2d");
      g.drawImage(img, 0, 0, S, S);
      var px = g.getImageData(0, 0, S, S).data, x0 = S, y0 = S, x1 = 0, y1 = 0;
      for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) if (px[(y * S + x) * 4 + 3] > 20) {
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
      if (x1 < x0) return;
      // same size box on every device, centered on the device itself
      box.style.left = ((x0 + x1) / 2 - 38) + "%";
      box.style.top = ((y0 + y1) / 2 - 42) + "%";
      mid[i] = [((x0 + x1) / 2 - 50) / 100, ((y0 + y1) / 2 - 50) / 100];
      if (D) kick();
    }
    if (img.complete) fit(); else img.addEventListener("load", fit);
  });

  var vw, vh, mob, D, secTop, step, midY = 0;
  function measure() {
    vw = innerWidth; vh = root.offsetHeight; mob = vw < 761;
    if (mob) { // phone: the device gets the space below the details, with room to breathe
      var top = Math.max.apply(null, items.map(function (el) { return el.offsetTop + el.offsetHeight; })) + 48;
      var bottom = vh - 72;
      D = Math.min(vw * 0.92, bottom - top);
      midY = (top + bottom) / 2 - vh / 2;
    } else D = Math.min(vw * 0.3, vh * 0.62);
    root.style.setProperty("--dv", D + "px"); // set once per resize, not per frame
    secTop = sec.getBoundingClientRect().top + scrollY;
    step = Math.max(1, sec.offsetHeight - vh) / Math.max(1, n - 1);
  }

  // one straight isometric line: next device up and right, previous down and left, all the same size
  function place(t) {
    var a = Math.abs(t), x, y, fade = mob ? 1.7 : 2.6;
    if (mob) { x = t * vw * 0.96; y = midY - t * vh * 0.05; }
    else { x = t * D * 0.82; y = vh * 0.04 - t * D * 0.57; }
    return { x: x, y: y, o: a > fade ? Math.max(0, 1 - (a - fade) / 0.5) : 1 };
  }

  var index = 0, cur = 0, from = 0, to = 0, t0 = 0, dur = reduce ? 1 : 950, raf = 0;
  var intro = reduce ? 1 : 0, introAt = 0;
  var tilt = devs.map(function () { return { x: 0, y: 0, tx: 0, ty: 0 }; });
  var ease = function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var out = function (x) { return 1 - Math.pow(1 - x, 3); };

  function sync() {
    items.forEach(function (el, j) { el.classList.toggle("is-on", j === index); }); // like CD: details follow the centered device
    devs.forEach(function (el, j) { el.classList.toggle("is-on", j === index); el.tabIndex = j === index ? 0 : -1; });
  }

  function frame(now) {
    raf = 0;
    var p = Math.min(1, (now - t0) / dur);
    cur = from + (to - from) * ease(p);
    if (introAt) intro = Math.min(1, (now - introAt) / 1500);
    var busy = p < 1 || (introAt && intro < 1);
    devs.forEach(function (el, i) {
      // during the intro the neighbours wait off-screen top right, then glide in
      var lag = i === index ? 0 : 1 - out(Math.max(0, Math.min(1, (intro - 0.35 - Math.abs(i - index) * 0.1) / 0.55)));
      var t = i - cur + lag * 2.2 * (i < index ? -1 : 1);
      var q = place(t), tl = tilt[i];
      tl.x += (tl.tx - tl.x) * 0.12; tl.y += (tl.ty - tl.y) * 0.12;
      if (Math.abs(tl.tx - tl.x) > 0.05 || Math.abs(tl.ty - tl.y) > 0.05) busy = true;
      var lift = Math.max(0, 1 - Math.abs(t)); // 1 when centered
      var up = lift * D * 0.05; // the centered device lifts a little
      var s = 1 + 0.05 * lift;
      var turn = i === index ? (1 - out(intro)) * 88 : 0; // the first device turns from edge-on to face you
      el.style.transform = "translate3d(" + (q.x - mid[i][0] * D * s).toFixed(1) + "px," + (q.y - up - mid[i][1] * D * s).toFixed(1) + "px,0) scale(" + s.toFixed(4) +
        ") rotateX(" + tl.y.toFixed(2) + "deg) rotateY(" + (turn + tl.x).toFixed(2) + "deg)";
      el.style.opacity = (q.o * (i === index ? Math.min(1, intro * 3 + 0.2) : 1)).toFixed(3);
      el.style.visibility = q.o <= 0 ? "hidden" : "visible";
    });
    if (busy) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }

  // the device in the middle follows the page position
  function onScroll() {
    var k = Math.max(0, Math.min(n - 1, Math.round((scrollY - secTop) / step)));
    if (k !== index) {
      index = k; from = cur; to = k; t0 = performance.now();
      sync();
    }
    kick();
  }

  /* ---- stepping: one gesture = one device ---- */
  var busyUntil = 0, lastT = 0, lastD = 0, gStart = 0;
  function go(k) { // jump the page to device k; the devices animate themselves
    k = Math.max(0, Math.min(n - 1, k));
    scrollTo({ top: Math.round(secTop + k * step), behavior: "instant" });
    busyUntil = performance.now() + (reduce ? 150 : 900);
  }
  // true when the gesture should move a device instead of the page
  function inside(dir) {
    var rel = scrollY - secTop, range = step * (n - 1);
    if (rel < -2 || rel > range + 2) return false; // section not pinned: scroll the page
    return dir > 0 ? index < n - 1 : index > 0;     // at the ends, let the page carry on
  }
  function move(dir) {
    if (performance.now() < busyUntil) return;
    go(index + dir);
  }
  // a trackpad flick fires dozens of wheel events with a decaying delta: one gesture, one step
  function onWheel(e) {
    var dir = Math.sign(e.deltaY);
    if (!dir || !inside(dir)) return;
    e.preventDefault();
    var now = e.timeStamp, d = Math.abs(e.deltaY);
    var fresh = now - gStart > 350 && (now - lastT > 400 || (d > lastD * 2.5 && d >= 10));
    lastT = now; lastD = d;
    if (fresh) { gStart = now; move(dir); }
  }
  var ty = null, held = false;
  function onTouchStart(e) { ty = e.touches[0].clientY; held = false; }
  function onTouchMove(e) {
    if (ty == null) return;
    var dy = ty - e.touches[0].clientY;
    if (!held && Math.abs(dy) < 8) return;
    if (!held && !inside(Math.sign(dy))) { ty = null; return; } // not ours: native scroll
    held = true;
    e.preventDefault();
    if (Math.abs(dy) > 30) { move(Math.sign(dy)); ty = null; }
  }
  var KEYS = { ArrowDown: 1, PageDown: 1, ArrowRight: 1, ArrowUp: -1, PageUp: -1, ArrowLeft: -1 };
  function onKey(e) {
    var dir = KEYS[e.key];
    if (!dir || /input|textarea|select/i.test(e.target.tagName) || !inside(dir)) return;
    e.preventDefault();
    move(dir);
  }

  // hover tilt + click: a side device comes to the center, the centered one opens
  devs.forEach(function (el, i) {
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      tilt[i].tx = ((e.clientX - r.left) / r.width - 0.5) * 10;
      tilt[i].ty = -((e.clientY - r.top) / r.height - 0.5) * 7;
      kick();
    });
    el.addEventListener("pointerleave", function () { tilt[i].tx = tilt[i].ty = 0; kick(); });
    el.addEventListener("click", function (e) {
      e.preventDefault();
      if (i === index) openDevice(data[i].id); else go(i);
    });
  });
  items.forEach(function (el, i) {
    el.querySelector(".dv-open").addEventListener("click", function (e) { e.preventDefault(); openDevice(data[i].id); });
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
  requestAnimationFrame(function () { requestAnimationFrame(function () { // after first paint, so the device turns in first and the details and brackets fade in after
    root.classList.add("dv-in");
    if (!reduce) introAt = performance.now();
    kick();
    if (document.fonts) document.fonts.ready.then(onResize); // the details block grows once the fonts land
  }); });
})();
