/* Device Carousel, wheel version with live 3D devices.

   The devices sit on a big wheel. The one in the brackets is framed; its neighbours peek in at the sides. One scroll gesture,
   swipe or arrow key turns the wheel one step and the next device rolls into the frame. Its details
   show top left. Clicking a side device turns it into the frame; clicking the framed one calls
   openDevice(). The wheel turns with a CSS transition on each device, so it never stutters.
   Each device is a small three.js canvas. The framed one floats, tilts toward the mouse and can be
   dragged left and right to spin it. Its still image shows until the model has loaded. */
import * as THREE from "./vendor/three.js"; // three.js r170, only the parts used here (see README)

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
    '<a class="dv' + (d.wip ? " is-wip" : "") + '" style="--i:' + i + '" href="' + esc(d.href || "#") + '" aria-label="' + esc(d.name + ": " + d.title) + '" tabindex="-1" draggable="false">' +
    '<img src="' + esc(d.image) + '" alt="" draggable="false"><canvas aria-hidden="true"></canvas></a>').join("");
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
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const rad = THREE.MathUtils.degToRad;

  /* ---- 3D: one small scene per device, all lit the same ---- */
  const views = devs.map((el) => {
    const r = new THREE.WebGLRenderer({ canvas: el.querySelector("canvas"), antialias: devicePixelRatio < 2, alpha: true }); // retina is sharp enough without MSAA, and saves a lot of memory
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.VSMShadowMap; // soft, blurred shadow
    const scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(r);
    scene.environment = pm.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
    pm.dispose();
    const pivot = new THREE.Group(); // floats, tilts and spins; the shadow wall stays put
    scene.add(pivot);
    return { r, scene, pivot, cam: null, ready: false, key: "", lift: 0, tx: 0, ty: 0, x: 0, y: 0, spin: 0, vel: 0 };
  });
  const loader = new THREE.GLTFLoader().setMeshoptDecoder(THREE.MeshoptDecoder)
    .setKTX2Loader(new THREE.KTX2Loader().setTranscoderPath("vendor/basis/").detectSupport(views[0].r)); // textures stay compressed on the GPU

  // centre the model, turn its screen to the camera, add its pair or phone, scale it so its width or height is 1
  function build(v, d, o, phone) {
    const aniso = v.r.capabilities.getMaxAnisotropy(); // keeps textures sharp on surfaces seen at an angle
    const prep = (g) => g.traverse((m) => {
      if (!m.isMesh) return;
      m.castShadow = true;
      if (m.material.isMeshBasicMaterial) m.material.toneMapped = false; // lit screens keep their colour
      for (const k of ["map", "normalMap", "roughnessMap", "metalnessMap", "emissiveMap", "aoMap"]) if (m.material[k]) m.material[k].anisotropy = aniso;
    });
    const centre = (g) => { const b = new THREE.Box3().setFromObject(g); g.position.sub(b.getCenter(new THREE.Vector3())); return b.getSize(new THREE.Vector3()); };
    prep(o);
    const size = centre(o);
    const front = new THREE.Group();
    front.add(o);
    front.rotation.y = rad(d.front || 0);
    const grp = new THREE.Group();
    grp.add(front);
    if (d.pair) { // the back of the same model, behind and to the left, like a product shot
      const back = new THREE.Group();
      back.add(o.clone());
      back.rotation.y = front.rotation.y + Math.PI;
      back.position.set(-size.x * 0.85, size.y * 0.02, -size.x * 0.15);
      grp.add(back);
    }
    if (phone) { // an iPhone standing in front of the laptop's left corner, at real-world scale (14.75 cm tall)
      prep(phone);
      const ps = centre(phone), ph = new THREE.Group();
      ph.add(phone);
      ph.rotation.y = Math.PI;
      ph.scale.setScalar(0.1475 / ps.y * (size.x / 0.298)); // the laptop is 29.8 cm wide
      ph.position.set(-size.x * 0.4, -size.y / 2 + ps.y * ph.scale.y / 2, size.z * 0.5 + 0.02);
      grp.add(ph);
    }
    grp.updateMatrixWorld(true);
    const box = new THREE.Box3();
    grp.traverse((m) => { if (m.isMesh && !m.name.startsWith("pen")) box.expandByObject(m); }); // size by the device, not an S Pen
    const s = box.getSize(new THREE.Vector3()), k = 1 / Math.max(s.x, s.y);
    grp.scale.setScalar(k);
    grp.position.copy(box.getCenter(new THREE.Vector3())).multiplyScalar(-k);
    v.pivot.add(grp);

    // camera straight in front (a little above for desks and laptops), light upper left, soft shadow on a wall behind
    const dir = new THREE.Vector3(0, Math.sin(rad(d.elev || 0)), Math.cos(rad(d.elev || 0)));
    v.cam = new THREE.PerspectiveCamera(27, 1, 0.01, 100); // about a 50 mm lens
    v.cam.position.copy(dir).multiplyScalar(0.8 / Math.tan(rad(13.5)));
    v.cam.zoom = 0.8 / 1.1; // the canvas is 2.2 device sizes wide, room for the whole shadow
    v.cam.updateProjectionMatrix();
    v.cam.lookAt(0, 0, 0);
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.copy(dir).multiplyScalar(4).add(new THREE.Vector3(-2.5, 0, 0)).setY(3.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.radius = 60;
    sun.shadow.blurSamples = 25;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.01;
    Object.assign(sun.shadow.camera, { left: -1.5, right: 1.5, top: 1.5, bottom: -1.5, near: 0.1, far: 30 });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.ShadowMaterial({ opacity: 0.11 }));
    wall.receiveShadow = true; // invisible wall just behind the device that only shows the shadow
    wall.lookAt(dir);
    wall.position.copy(dir).multiplyScalar(-(s.z * k / 2 + 0.12));
    v.scene.add(sun, sun.target, wall);
  }

  // the framed device loads first, then the rest one by one
  async function load(i) {
    const d = data[i], v = views[i];
    const [g, p] = await Promise.all([loader.loadAsync(d.model), d.phone && loader.loadAsync(d.phone)]);
    build(v, d, g.scene, p && p.scene);
    v.ready = true;
    v.key = "";
    v.r.render(v.scene, v.cam);
    devs[i].classList.add("is-3d");
    kick();
  }

  /* ---- layout: device size D, frame centre (cx, cy), wheel radius R ---- */
  const STEP = 46; // degrees between devices on the wheel
  let D, secTop, step;
  function measure() {
    const vw = innerWidth, vh = root.offsetHeight;
    let cx, cy, gap; // gap = how far a neighbour sits sideways from the frame
    if (vw < 761) { // phone: the frame sits below the details, one device on screen
      const top = Math.max(...items.map((el) => el.offsetTop + el.offsetHeight)) + 40;
      const bottom = vh - 64;
      D = Math.min(vw * 0.72, (bottom - top) * 0.82);
      cx = 0; cy = (top + bottom) / 2 - vh / 2; gap = vw * 1.5; // neighbours sit off screen: one device at a time
    } else { // desktop: details left, a big frame right; the previous device shows bottom left, the next peeks in at the right edge
      D = Math.min(vw * 0.42, vh * 0.62);
      cx = vw * 0.16; cy = vh * -0.03; gap = vw * 0.5;
    }
    root.style.setProperty("--step", STEP + "deg");
    root.style.setProperty("--dv", D + "px");
    root.style.setProperty("--cx", cx + "px");
    root.style.setProperty("--cy", cy + "px");
    root.style.setProperty("--r", gap / Math.sin(STEP * Math.PI / 180) + "px"); // the radius that puts a neighbour exactly gap sideways
    views.forEach((v) => { v.r.setSize(D * 2.2, D * 2.2, false); v.key = ""; });
    kick();
    secTop = sec.getBoundingClientRect().top + scrollY;
    step = Math.max(1, sec.offsetHeight - vh) / Math.max(1, n - 1);
  }

  /* ---- state: index = device in the frame ---- */
  let index = 0, boxTimer = 0, raf = 0;

  // redraw a canvas only when its model moved: the framed one floats, tilts and spins; the rest sit still
  function frame(now) {
    raf = 0;
    const r = root.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return; // off screen: stop until the next scroll
    let busy = false;
    views.forEach((v, i) => {
      if (!v.ready) return;
      const on = i === index && root.classList.contains("dv-in");
      if (!on) v.tx = v.ty = 0;
      v.lift += ((on && !reduce ? 0.03 : 0) - v.lift) * 0.08;
      v.x += (v.tx - v.x) * 0.1;
      v.y += (v.ty - v.y) * 0.1;
      if (!v.drag) { v.spin += v.vel; v.vel *= 0.94; }
      if (Math.abs(v.vel) < 1e-4) v.vel = 0;
      const float = on && !reduce ? Math.sin(now / 650) * 0.012 : 0;
      if (float || v.vel || Math.abs(v.tx - v.x) > 0.01 || Math.abs(v.ty - v.y) > 0.01 || Math.abs((on ? 0.03 : 0) - v.lift) > 0.0005) busy = true;
      v.pivot.rotation.set(rad(v.y), v.spin + rad(v.x), 0);
      v.pivot.position.y = v.lift + float;
      const key = v.pivot.rotation.x.toFixed(4) + v.pivot.rotation.y.toFixed(4) + v.pivot.position.y.toFixed(4);
      if (key !== v.key) { v.key = key; v.r.render(v.scene, v.cam); }
    });
    if (busy) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  function sync() {
    root.style.setProperty("--k", index); // every device turns to (its place - index) × STEP
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
    kick();
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
    if (ty == null || spinning) return;
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

  // the framed device: drag left/right to spin it (it keeps turning a little, then stays), tilt toward the mouse.
  // A side device turns into the frame on click; the framed one opens (unless it's not ready yet)
  let spinning = false, dragged = false;
  devs.forEach((el, i) => {
    const v = views[i];
    let x0 = 0, y0 = 0, lastX = 0, axis = "";
    el.addEventListener("pointerdown", (e) => {
      if (i !== index || !v.ready || e.button) return;
      x0 = lastX = e.clientX; y0 = e.clientY; axis = ""; dragged = false;
      v.drag = true; v.vel = 0;
    });
    el.addEventListener("pointermove", (e) => {
      if (finePointer && i === index && !reduce) { // tilt: up to ±8° sideways, ±4° up and down
        const r = el.getBoundingClientRect();
        v.tx = ((e.clientX - r.left) / r.width - 0.5) * 16;
        v.ty = ((e.clientY - r.top) / r.height - 0.5) * 8;
        kick();
      }
      if (!v.drag) return;
      if (!axis && Math.hypot(e.clientX - x0, e.clientY - y0) > 6) { // decide once: sideways spins, up/down is the page's
        axis = Math.abs(e.clientX - x0) > Math.abs(e.clientY - y0) ? "x" : "y";
        if (axis === "x") { spinning = dragged = true; el.setPointerCapture(e.pointerId); } else v.drag = false;
      }
      if (axis !== "x") return;
      const dx = (e.clientX - lastX) * 0.012;
      lastX = e.clientX;
      v.spin += dx;
      v.vel = reduce ? 0 : dx;
      kick();
    });
    const end = () => { v.drag = false; spinning = false; kick(); };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("pointerleave", () => { v.tx = v.ty = 0; kick(); });
    el.addEventListener("click", (e) => {
      e.preventDefault();
      if (dragged) { dragged = false; return; } // the end of a spin is not a click
      if (i !== index) go(i);
      else if (!data[i].wip) openDevice(data[i].id);
    });
  });
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
  (async () => {
    for (const i of [index, ...data.keys()].filter((i, j, a) => a.indexOf(i) === j)) await load(i).catch((e) => console.error(data[i].model, e)); // a failed model keeps its image
  })();
  root.style.setProperty("--k", -1); // intro: the wheel starts one step back and turns the first device into the frame
  requestAnimationFrame(() => requestAnimationFrame(() => {
    root.classList.add("dv-in");
    root.style.setProperty("--k", index);
    kick();
    if (document.fonts) document.fonts.ready.then(onResize); // the details block grows once the fonts land
  }));
}
