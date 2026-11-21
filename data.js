/* Your case studies, in order round the wheel. The first one starts in the frame.

   id        passed to openDevice(id) when the device in the frame is clicked
   name      the device, used for screen readers
   title     big name above the table
   keywords  rows in the table (label, value)
   model     .glb of the device (compressed, any scale: it is fitted to size)
   image     still of the same model, shown until the model has loaded
   elev      degrees the camera looks down from; a little for desks and laptops (optional)
   front     degrees to turn the model so its screen faces you (optional)
   pair      true: two copies, back behind and screen in front (optional)
   phone     .glb of a phone to stand in front of the laptop's left corner (optional)
   href      link placeholder for the case study
   wip       true: greyed out and can't be opened (optional)
*/
window.DEVICES = [
  {
    id: "freedrama",
    name: "Pixel phone",
    title: "FreeDrama",
    keywords: [["Role", "Senior Product Designer"], ["Company", "Kuku"], ["Year", "2026"], ["Platform", "Android"]],
    model: "models/pixel.glb", pair: true,
    image: "assets/pixel-front.webp?v=3",
    href: "#"
  },
  {
    id: "display",
    name: "Mac Pro and Pro Display XDR",
    title: "Control Room",
    keywords: [["Role", "Product Designer"], ["Company", "Studio"], ["Year", "2025"], ["Platform", "Web"]],
    model: "models/macpro.glb", elev: 12,
    image: "assets/macpro-front.webp?v=3",
    href: "#"
  },
  {
    id: "iphone",
    name: "iPhone",
    title: "Night Shift",
    keywords: [["Role", "UI Designer"], ["Company", "Studio"], ["Year", "2024"], ["Platform", "iOS"]],
    model: "models/iphone.glb", front: 180, pair: true,
    image: "assets/iphone-front.webp?v=3",
    href: "#"
  },
  {
    id: "macbook",
    name: "MacBook Neo and iPhone",
    title: "Field Notes",
    keywords: [["Role", "Design Lead"], ["Company", "Studio"], ["Year", "2023"], ["Platform", "Web + Mobile"]],
    model: "models/neo.glb", phone: "models/iphone.glb", elev: 12,
    image: "assets/macphone-front.webp?v=3",
    href: "#"
  },
  {
    id: "rocketpay",
    name: "Galaxy S23 Ultra",
    title: "RocketPay",
    keywords: [["Role", "Product Designer"], ["Company", "RocketPay"], ["Year", "2022"], ["Platform", "Android"]],
    model: "models/samsung.glb",
    image: "assets/samsung-front.webp?v=3",
    href: "#",
    wip: true
  }
];
