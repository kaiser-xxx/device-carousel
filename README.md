# Device Carousel

A scroll-driven carousel of isometric 3D devices, built in plain HTML, CSS and JavaScript. No framework, no build step. Sibling of [CD Carousel](https://github.com/kaiser-xxx/cd-carousel).

## What it does

- Devices sit on one isometric line, rising from bottom left to top right. It opens on the first device.
- One scroll, swipe or arrow key moves one device along the line. The device in the middle lifts. Past the first or last device, the page scrolls normally if there is more content.
- Corner brackets mark the centered device, and its title and details show top left.
- Click a side device to bring it to the center. Click the centered device to open it.
- The first device spins in on load. The centered device floats gently over a soft shadow.
- On a mouse, devices tilt toward the pointer.
- Each device is a small three.js canvas that only redraws while its model moves. Moving along the line is CSS transforms. Respects reduced motion.

## Use it

1. Download or clone the repo.
2. Serve the folder (for example `npx serve`) and open it in a browser.

To use your own content, edit the `DEVICES` array in `data.js`:

```js
{
  id: "iphone",
  name: "iPhone",
  title: "Night Shift",
  keywords: [["Role", "UI designer"], ["Platform", "iOS"], ["Year", "2024"], ["Type", "App"]],
  model: "models/iphone.glb", front: 180, pair: true,
  href: "/night-shift"
}
```

| Field | What it shows |
| --- | --- |
| `id` | Passed to `openDevice(id)` when the centered device is clicked |
| `name` | The device, read out to screen readers |
| `title` | Big name above the table |
| `keywords` | Rows in the table (label, value) |
| `model` | `.glb` file of the device. Compress it first (see below). |
| `front` | Degrees to turn the model so its screen faces you (optional) |
| `pair` | `true` shows the back of the same model behind it (optional) |
| `href` | Link to the device's page |

Clicking the centered device calls `openDevice(id)` in `devices.js`. It is empty for now. Add your routing there.

## Adding a model

Compress each `.glb` before adding it. Colour textures are lossy WebP; surface maps stay lossless and the mesh is only simplified where nothing visible changes, so curved and bumpy surfaces stay smooth:

```
npx @gltf-transform/cli optimize in.glb a.glb --compress false --texture-compress false --simplify-error 0.0002 --simplify-lock-border true --palette false
npx @gltf-transform/cli resize a.glb b.glb --width 1024 --height 1024
npx @gltf-transform/cli webp b.glb c.glb --slots "{baseColorTexture,emissiveTexture}" --quality 90
npx @gltf-transform/cli webp c.glb d.glb --slots "{normalTexture,metallicRoughnessTexture,occlusionTexture}" --lossless true
npx @gltf-transform/cli meshopt d.glb models/out.glb --quantize-normal 12
```

## Files

```
index.html        the page
style.css         styles
data.js           the devices
devices.js        layout, motion and the 3D scenes
models/           compressed .glb models
vendor/three.js   three.js r170, only the parts devices.js uses (MIT, see three.LICENSE)
```

`vendor/three.js` is built once with esbuild from `three@0.170`. If `devices.js` starts using another part of three.js, add it to the export list and rebuild:

```
export { WebGLRenderer, ACESFilmicToneMapping, VSMShadowMap, Scene, PMREMGenerator, DirectionalLight, Mesh, PlaneGeometry, ShadowMaterial, OrthographicCamera, Group, Box3, Vector3, MathUtils } from "three";
export { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
export { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
export { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
```

```
npx esbuild entry.js --bundle --format=esm --minify --outfile=vendor/three.js
```

## License

MIT. Built by [Siddhant Shakya](https://siddhantshakya.in).
