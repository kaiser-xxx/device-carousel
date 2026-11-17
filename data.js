/* Your devices, in order along the line (bottom left to top right).

   id        passed to openDevice(id) when the centered device is clicked
   name      the device, used for screen readers
   title     big name above the table when the device is centered
   keywords  rows in the table (label, value)
   model     .glb file of the device (compressed with gltf-transform; any scale, it is fitted to size)
   front     degrees to turn the model so its screen faces you (optional)
   pair      true: show two copies, back behind and screen in front (optional)
   href      link placeholder for the device's page
*/
window.DEVICES = [
  {
    id: "pixel",
    name: "Pixel phone",
    title: "Pocket Studio",
    keywords: [["Role", "Lead designer"], ["Platform", "Android"], ["Year", "2025"], ["Type", "App"]],
    model: "models/pixel.glb", pair: true,
    href: "#"
  },
  {
    id: "display",
    name: "Studio Display",
    title: "Control Room",
    keywords: [["Role", "Product designer"], ["Platform", "Web"], ["Year", "2024"], ["Type", "Dashboard"]],
    model: "models/display.glb",
    href: "#"
  },
  {
    id: "iphone",
    name: "iPhone",
    title: "Night Shift",
    keywords: [["Role", "UI designer"], ["Platform", "iOS"], ["Year", "2024"], ["Type", "App"]],
    model: "models/iphone.glb", front: 180, pair: true,
    href: "#"
  },
  {
    id: "macbook",
    name: "MacBook Pro",
    title: "Field Notes",
    keywords: [["Role", "Design lead"], ["Platform", "Web + mobile"], ["Year", "2023"], ["Type", "SaaS"]],
    model: "models/macbook.glb",
    href: "#"
  },
  {
    id: "samsung",
    name: "Galaxy S23 Ultra",
    title: "Long Weekend",
    keywords: [["Role", "Product designer"], ["Platform", "Android"], ["Year", "2022"], ["Type", "App"]],
    model: "models/samsung.glb", front: 180,
    href: "#"
  }
];
