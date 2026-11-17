# Device Carousel

A scroll-driven carousel of isometric devices, built in plain HTML, CSS and JavaScript. No framework, no build step. Sibling of [CD Carousel](https://github.com/kaiser-xxx/cd-carousel).

## What it does

- Devices sit on one isometric line, rising from bottom left to top right. It opens on the first device.
- One scroll, swipe or arrow key moves one device along the line. The device in the middle lifts. Past the first or last device, the page scrolls normally if there is more content.
- Corner brackets mark the centered device, and its title and details show top left.
- Click a side device to bring it to the center. Click the centered device to open it.
- On load the devices slide in along the path one by one.
- On a mouse, a hovered side device nudges toward the centre.
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
  href: "/night-shift"
}
```

| Field | What it shows |
| --- | --- |
| `id` | Passed to `openDevice(id)` when the centered device is clicked |
| `name` | The device, read out to screen readers |
| `title` | Big name above the table |
| `keywords` | Rows in the table (label, value) |
| `image` | Transparent image of the device with its shadow, square. The device sits in the box from 11% to 67% of the image on both axes; the rest is room for the shadow. |
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
