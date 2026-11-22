# Device Carousel

A scroll-driven wheel of live 3D devices, built in plain HTML, CSS and JavaScript with three.js. No framework, no build step. Sibling of [CD Carousel](https://github.com/kaiser-xxx/cd-carousel).

## What it does

- The devices sit on a big wheel. The one inside the corner brackets is framed; the previous one shows bottom left and the next peeks in at the right edge.
- One scroll, swipe or arrow key turns the wheel one step, and the next device rolls into the frame. Its details show top left.
- Click the framed device to open it. A case study marked `wip` is greyed out and can't be opened.
- The framed device floats and tilts toward the mouse. Drag it left or right to spin it; it keeps turning a little, then stays.
- Each device is a small three.js canvas that only redraws while its model moves. The wheel itself turns with CSS transitions, so it stays smooth. Respects reduced motion.
- The framed model loads first, the rest one by one. Each shows a still image until its model is ready.

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
  image: "assets/iphone-front.webp",
  href: "/night-shift"
}
```

| Field | What it shows |
| --- | --- |
| `id` | Passed to `openDevice(id)` when the framed device is clicked |
| `name` | The device, read out to screen readers |
| `title` | Big name above the table |
| `keywords` | Rows in the table (label, value) |
| `model` | `.glb` of the device, compressed (see below). Any scale: it is fitted to size |
| `image` | Still of the same model in a transparent square, shown until the model loads. The frame is 1/2.5 of the image |
| `front` | Degrees to turn the model so its screen faces you (optional) |
| `pair` | `true` shows two copies, back behind and screen in front (optional) |
| `phone` | `.glb` of a phone to stand beside the laptop (optional) |
| `wip` | `true` greys it out and stops it opening (optional) |
| `href` | Link to the device's page |

Clicking the framed device calls `openDevice(id)` in `devices.js`. It is empty for now. Add your routing there.

## Models

Colour and surface maps are 4K, normal maps 2K, all KTX2 so they stay compressed on the GPU; geometry is meshopt-compressed. The settled colours are baked into the files. To compress a new model:

```
npx gltf-transform dedup in.glb a.glb && npx gltf-transform prune a.glb a.glb
npx gltf-transform uastc a.glb b.glb --slots "normalTexture" --level 2 --zstd 18
npx gltf-transform etc1s b.glb c.glb --quality 255
npx gltf-transform meshopt c.glb models/out.glb
```

`vendor/three.js` is three.js r170 with only the parts `devices.js` uses, built once with esbuild. `vendor/basis/` is three.js's KTX2 transcoder.

## Files

```
index.html   the page
style.css    styles
data.js      the devices
devices.js   layout, motion and 3D
models/      device models
assets/      still of each model
vendor/      three.js and its KTX2 transcoder
```

## License

MIT. Built by [Siddhant Shakya](https://siddhantshakya.in).
