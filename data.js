/* Your devices, in order along the line (bottom left to top right).

   id        passed to openDevice(id) when the centered device is clicked
   name      the device, used for screen readers
   title     big name above the table when the device is centered
   keywords  rows in the table (label, value)
   image     transparent image of the device with its shadow (see README for the framing)
   href      link placeholder for the device's page
*/
window.DEVICES = [
  {
    id: "pixel",
    name: "Pixel phone",
    title: "Pocket Studio",
    keywords: [["Role", "Lead designer"], ["Platform", "Android"], ["Year", "2025"], ["Type", "App"]],
    image: "assets/pixel.webp",
    href: "#"
  },
  {
    id: "display",
    name: "Studio Display",
    title: "Control Room",
    keywords: [["Role", "Product designer"], ["Platform", "Web"], ["Year", "2024"], ["Type", "Dashboard"]],
    image: "assets/display.webp",
    href: "#"
  },
  {
    id: "iphone",
    name: "iPhone",
    title: "Night Shift",
    keywords: [["Role", "UI designer"], ["Platform", "iOS"], ["Year", "2024"], ["Type", "App"]],
    image: "assets/iphone.webp",
    href: "#"
  },
  {
    id: "macbook",
    name: "MacBook Pro",
    title: "Field Notes",
    keywords: [["Role", "Design lead"], ["Platform", "Web + mobile"], ["Year", "2023"], ["Type", "SaaS"]],
    image: "assets/macbook.webp",
    href: "#"
  },
  {
    id: "samsung",
    name: "Galaxy S23 Ultra",
    title: "Long Weekend",
    keywords: [["Role", "Product designer"], ["Platform", "Android"], ["Year", "2022"], ["Type", "App"]],
    image: "assets/samsung.webp",
    href: "#"
  }
];
