/* Your case studies, in order round the wheel. The first one starts in the frame.

   id        passed to openDevice(id) when the device in the frame is clicked
   name      the device, used for screen readers
   title     big name above the table
   keywords  rows in the table (label, value)
   image     the device, front view, centred in a transparent square with its shadow
   href      link placeholder for the case study
   wip       true: greyed out and can't be opened (optional)
*/
window.DEVICES = [
  {
    id: "freedrama",
    name: "Pixel phone",
    title: "FreeDrama",
    keywords: [["Role", "Senior Product Designer"], ["Company", "Kuku"], ["Year", "2026"], ["Platform", "Android"]],
    image: "assets/pixel-front.webp?v=2",
    href: "#"
  },
  {
    id: "display",
    name: "Studio Display",
    title: "Control Room",
    keywords: [["Role", "Product Designer"], ["Company", "Studio"], ["Year", "2025"], ["Platform", "Web"]],
    image: "assets/display-front.webp?v=2",
    href: "#"
  },
  {
    id: "iphone",
    name: "iPhone",
    title: "Night Shift",
    keywords: [["Role", "UI Designer"], ["Company", "Studio"], ["Year", "2024"], ["Platform", "iOS"]],
    image: "assets/iphone-front.webp?v=2",
    href: "#"
  },
  {
    id: "macbook",
    name: "MacBook Pro and iPhone",
    title: "Field Notes",
    keywords: [["Role", "Design Lead"], ["Company", "Studio"], ["Year", "2023"], ["Platform", "Web + Mobile"]],
    image: "assets/macphone-front.webp?v=2",
    href: "#"
  },
  {
    id: "rocketpay",
    name: "Galaxy S23 Ultra",
    title: "RocketPay",
    keywords: [["Role", "Product Designer"], ["Company", "RocketPay"], ["Year", "2022"], ["Platform", "Android"]],
    image: "assets/samsung-front.webp?v=2",
    href: "#",
    wip: true
  }
];
