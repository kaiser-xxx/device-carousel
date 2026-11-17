/* Device Carousel: a scroll-driven carousel of isometric 3D devices.
   Sibling of CD Carousel (github.com/kaiser-xxx/cd-carousel), same motion and inputs.

   One scroll gesture, swipe or arrow key moves one device along the diagonal. The centered
   device floats gently off its shadow, gets corner brackets and its details show top left.
   Clicking a side device brings it to the center; clicking the centered one calls openDevice().
   On a mouse, devices tilt toward the pointer. The first device spins in on load.
   Each device is its own small three.js canvas and only redraws while its model moves;
   moving along the line is plain CSS transforms. */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

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
    '<canvas class="dv-3d" aria-hidden="true"></canvas>' +
    '<span class="dv-box" aria-hidden="true"><i></i><i></i><i></i><i></i></span></a>').join("");
  root.querySelector(".dv-items").innerHTML = data.map((d, i) =>
    '<li class="dv-item"><h3 class="dv-title">' + esc(d.title) + '</h3><dl class="dv-rows">' +
    (d.keywords || []).map((f) => '<div><dt class="mono">' + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd></div>").join("") +
    '</dl><a class="dv-open mono" href="' + esc(d.href || "#") + '">Open device ' + pad(i + 1) + "</a></li>").join("");
  root.querySelector(".dv-count").textContent = pad(n);
  sec.style.setProperty("--n", n);

  const devs = [...root.querySelectorAll(".dv")];
  const items = [...root.querySelectorAll(".dv-item")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---- one small 3D scene per device, all lit the same ---- */
  // the canvas reaches 20% past the device box up and left, 60% down and right, so the long shadow is never cut
  const U = 1.5; // world units per device box
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const views = devs.map((el, i) => {
    const r = new THREE.WebGLRenderer({ canvas: el.querySelector("canvas"), antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.VSMShadowMap; // soft, blurred shadow
    const scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(r);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(-2.9, 6, 5.2); // 45° above the floor
    sun.castShadow = true;
    sun.shadow.mapSize.set(512, 512);
    sun.shadow.radius = 40;
    sun.shadow.blurSamples = 25;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.01;
    Object.assign(sun.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2, near: 0.1, far: 20 });
    scene.add(sun, sun.target);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(5, 5).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ opacity: 0.11 }));
    floor.receiveShadow = true; // invisible floor that only shows the shadow
    scene.add(floor);
    const cam = new THREE.OrthographicCamera(-0.7 * U, 1.1 * U, 0.7 * U, -1.1 * U, 0.01, 100);
    cam.position.set(5, 4.1, 5);
    cam.lookAt(0, 0, 0);
    const pivot = new THREE.Group(); // spins, tilts and floats; the floor stays put
    scene.add(pivot);
    const v = { r, scene, cam, pivot, floor, ready: false, key: "" };
    loader.loadAsync(data[i].model).then((g) => { fitModel(v, g.scene, data[i]); v.ready = true; v.key = ""; startIntro(); kick(); });
    return v;
  });

  // centre the model, turn its screen to the camera, optionally pair it with a back copy, scale it to one size
  function fitModel(v, o, d) {
    const aniso = v.r.capabilities.getMaxAnisotropy(); // keeps textures sharp on surfaces seen at an angle
    o.traverse((m) => {
      if (!m.isMesh) return;
      m.castShadow = true;
      for (const k of ["map", "normalMap", "roughnessMap", "metalnessMap", "emissiveMap", "aoMap"]) if (m.material[k]) m.material[k].anisotropy = aniso;
    });
    const b0 = new THREE.Box3().setFromObject(o);
    const size = b0.getSize(new THREE.Vector3());
    o.position.sub(b0.getCenter(new THREE.Vector3()));
    const front = new THREE.Group();
    front.add(o);
    front.rotation.y = THREE.MathUtils.degToRad(d.front || 0);
    const grp = new THREE.Group();
    grp.add(front);
    if (d.pair) { // the back of the same model, behind and to the left, like a product shot
      const back = new THREE.Group();
      back.add(o.clone());
      back.rotation.y = front.rotation.y + Math.PI;
      back.position.set(-size.x * 0.85, size.y * 0.02, -size.x * 0.15);
      grp.add(back);
    }
    grp.updateMatrixWorld(true);
    const box = new THREE.Box3();
    grp.traverse((m) => { if (m.isMesh && !m.name.startsWith("pen")) box.expandByObject(m); }); // size by the device, not an S Pen
    const s = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    const k = 1 / Math.max(s.x, s.y, s.z);
    grp.scale.setScalar(k);
    grp.position.copy(c).multiplyScalar(-k);
    v.pivot.add(grp);
    v.floor.position.y = -s.y * k / 2 - 0.001;
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
    views.forEach((v) => { v.r.setSize(D * 1.8, D * 1.8, false); v.key = ""; });
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
  const tilt = devs.map(() => ({ x: 0, y: 0, l: 0, tx: 0, ty: 0, tl: 0 }));
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const out = (x) => 1 - Math.pow(1 - x, 3);
  const rad = THREE.MathUtils.degToRad;

  function sync() {
    items.forEach((el, j) => el.classList.toggle("is-on", j === index)); // like CD: details follow the centered device
    devs.forEach((el, j) => { el.classList.toggle("is-on", j === index); el.tabIndex = j === index ? 0 : -1; });
  }

  // the intro waits for the first model, so the device spins in before the details and brackets fade in
  function startIntro() {
    if (introAt || !views[index].ready || !root.classList.contains("dv-ready")) return;
    root.classList.add("dv-in");
    introAt = performance.now();
    kick();
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
      const q = place(t), tl = tilt[i], v = views[i];
      tl.x += (tl.tx - tl.x) * 0.12; tl.y += (tl.ty - tl.y) * 0.12; tl.l += (tl.tl - tl.l) * 0.12;
      if (Math.abs(tl.tx - tl.x) > 0.05 || Math.abs(tl.ty - tl.y) > 0.05 || Math.abs(tl.tl - tl.l) > 0.001) busy = true;
      const centered = Math.max(0, 1 - Math.abs(t)); // 1 when centered
      el.style.transform = "translate3d(" + q.x.toFixed(1) + "px," + q.y.toFixed(1) + "px,0) scale(" + (1 + 0.05 * centered).toFixed(4) + ")";
      el.style.opacity = (q.o * (i === index ? Math.min(1, intro * 3) : 1)).toFixed(3);
      el.style.visibility = q.o <= 0 ? "hidden" : "visible";
      if (!v.ready || q.o <= 0) return;
      // model motion: spin in on load, tilt to the pointer, lift and float while centered (the shadow stays on the floor)
      const spin = i === index ? (1 - out(intro)) * -70 : 0;
      const float = reduce ? 0 : centered * Math.sin(now / 650) * 0.015;
      if (centered > 0.01 && !reduce && introAt) busy = true; // the float keeps the centered device drawing
      v.pivot.rotation.set(rad(tl.y), rad(spin + tl.x), 0);
      v.pivot.position.y = centered * 0.05 + tl.l + float;
      const key = v.pivot.rotation.x.toFixed(4) + v.pivot.rotation.y.toFixed(4) + v.pivot.position.y.toFixed(4);
      if (key !== v.key) { v.key = key; v.r.render(v.scene, v.cam); } // redraw only when the model moved
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

  // hover tilt (mouse only) + click: a side device comes to the center, the centered one opens
  devs.forEach((el, i) => {
    if (finePointer && !reduce) {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        tilt[i].tx = ((e.clientX - r.left) / r.width - 0.5) * 20; // up to ±10° toward the pointer
        tilt[i].ty = ((e.clientY - r.top) / r.height - 0.5) * 8;  // up to ±4°
        tilt[i].tl = 0.02;                                         // and a small lift
        kick();
      });
      el.addEventListener("pointerleave", () => { tilt[i].tx = tilt[i].ty = tilt[i].tl = 0; kick(); });
    }
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
  requestAnimationFrame(() => requestAnimationFrame(() => { // after first paint, so the fades run
    root.classList.add("dv-ready");
    startIntro();
    if (document.fonts) document.fonts.ready.then(onResize); // the details block grows once the fonts land
  }));
}
