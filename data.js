/* Your devices, in order along the line (bottom left to top right).

   id        passed to openDevice(id) when the centered device is clicked
   name      the device, used for screen readers
   title     big name above the table when the device is centered
   keywords  rows in the table (label, value)
   image     transparent image of the device, square canvas, all at the same scale
   screens   slots laid over the device's screen:
             at    3 corners in % of the image: top left, top right, bottom left (the 4th follows)
             r     corner radius in % of the image
             src   optional: your screenshot, in the screen's own aspect ratio
             clip  optional: CSS polygon that hides part of the slot (e.g. behind another device)
   href      link placeholder for the device's page
*/
window.DEVICES = [
  {
    id: "pixel",
    name: "Pixel phone",
    title: "Pocket Studio",
    keywords: [["Role", "Lead designer"], ["Platform", "Android"], ["Year", "2025"], ["Type", "App"]],
    image: "assets/pixel.webp",
    screens: [{ at: [[45.42, 29.77], [66.85, 42.02], [45.42, 80.49]], r: 2 }],
    href: "#"
  },
  {
    id: "imac",
    name: "iMac",
    title: "Control Room",
    keywords: [["Role", "Product designer"], ["Platform", "Web"], ["Year", "2024"], ["Type", "Dashboard"]],
    image: "assets/imac.webp",
    screens: [{ at: [[22.55, 12.57], [72.5, 42.51], [22.55, 47.6]], r: 0.2 }],
    href: "#"
  },
  {
    id: "iphone",
    name: "iPhone",
    title: "Night Shift",
    keywords: [["Role", "UI designer"], ["Platform", "iOS"], ["Year", "2024"], ["Type", "App"]],
    image: "assets/iphone.webp",
    screens: [{ at: [[38.52, 25.5], [63.56, 39.09], [38.52, 81.52]], r: 2.4 }],
    href: "#"
  },
  {
    id: "macbook",
    name: "MacBook and phone",
    title: "Field Notes",
    keywords: [["Role", "Design lead"], ["Platform", "Web + mobile"], ["Year", "2023"], ["Type", "SaaS"]],
    image: "assets/macbook.webp",
    screens: [
      { at: [[33.75, 11.82], [73.84, 34.7], [33.75, 42.36]], r: 0.2, clip: "0 0, 100% 0, 100% 61%, 67.6% 43%, 67.6% 100%, 0 100%" },
      { at: [[68.98, 43.71], [78.98, 49.5], [68.98, 71.82]], r: 1.4 }
    ],
    href: "#"
  },
  {
    id: "android",
    name: "Android phone",
    title: "Long Weekend",
    keywords: [["Role", "Product designer"], ["Platform", "Android"], ["Year", "2022"], ["Type", "App"]],
    image: "assets/android.webp",
    screens: [{ at: [[35.9, 15.6], [59.1, 28.4], [35.9, 72.1]], r: 1.6 }],
    href: "#"
  }
];
