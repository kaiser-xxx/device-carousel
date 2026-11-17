# Device Carousel

A scroll-driven carousel of isometric devices, built in plain HTML, CSS and JavaScript. No framework, no build step. Sibling of [CD Carousel](https://github.com/kaiser-xxx/cd-carousel).

## What it does

- Devices sit on one isometric line, rising from bottom left to top right. It opens on the second device.
- One scroll, swipe or arrow key moves one device along the line. The device in the middle lifts. Past the first or last device, the page scrolls normally if there is more content.
- Click a device to focus it: it grows, the others fade back, a hand-drawn ring draws in and its details show top left.
- Click the focused device again to open it. Esc, a click on empty space or a scroll unfocuses.
- Devices tilt toward the pointer.
- Every device has a screen slot, so you can drop your own screenshots in.
- Animates only transforms and opacity, so it stays smooth. Respects reduced motion.

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
  image: "assets/iphone.webp",
  screens: [{ at: [[38.52, 25.5], [63.56, 39.09], [38.52, 81.52]], r: 2.4, src: "shots/night-shift.png" }],
  href: "/night-shift"
}
```

| Field | What it shows |
| --- | --- |
| `id` | Passed to `openDevice(id)` when the focused device is clicked |
| `name` | The device, read out to screen readers |
| `title` | Big name above the table |
| `keywords` | Rows in the table (label, value) |
| `image` | Transparent image of the device. Use a square canvas, with all devices at the same scale. |
| `screens` | Slots over the device's screen. `at` is three corners in % of the image: top left, top right, bottom left. `r` is the corner radius. `src` is your screenshot, in the screen's own aspect ratio. `clip` hides part of a slot. |
| `href` | Link to the device's page |

Clicking the focused device calls `openDevice(id)` in `devices.js`. It is empty for now. Add your routing there.

## Files

```
index.html   the page
style.css    styles
data.js      the devices
devices.js   rendering, layout and motion
assets/      device images
```

## License

MIT. Built by [Siddhant Shakya](https://siddhantshakya.in).
