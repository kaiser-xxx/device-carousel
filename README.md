# Device Carousel

A scroll-driven wheel of devices, built in plain HTML, CSS and JavaScript. No framework, no build step. Sibling of [CD Carousel](https://github.com/kaiser-xxx/cd-carousel).

## What it does

- The devices sit on a big wheel. The one inside the corner brackets is framed; the previous one shows bottom left and the next peeks in at the right edge.
- One scroll, swipe or arrow key turns the wheel one step, and the next device rolls into the frame. Its details show top left.
- Click the framed device to open it. A case study marked `wip` is greyed out and can't be opened.
- Each device turns with a CSS transition on its own transform, so the motion stays smooth. Respects reduced motion.

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
  image: "assets/iphone-front.webp",
  href: "/night-shift"
}
```

| Field | What it shows |
| --- | --- |
| `id` | Passed to `openDevice(id)` when the centered device is clicked |
| `name` | The device, read out to screen readers |
| `title` | Big name above the table |
| `keywords` | Rows in the table (label, value) |
| `image` | Front view of the device with its shadow, centred in a transparent square. The device is 1/2.4 of the image; the rest holds its whole shadow. |
| `wip` | `true` greys it out and stops it opening (optional) |
| `href` | Link to the device's page |

Clicking the centered device calls `openDevice(id)` in `devices.js`. It is empty for now. Add your routing there.

## Images

The device images were rendered from 3D models with the same 45° light and a soft shadow, enhanced, then cut out to transparent WebP at 1600px.

## Files

```
index.html   the page
style.css    styles
data.js      the devices
devices.js   layout and motion
assets/      device images
```

## License

MIT. Built by [Siddhant Shakya](https://siddhantshakya.in).
