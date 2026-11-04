import { uid } from "@/lib/ids";
import type {
  Category,
  CategorySlug,
  Product,
  ProductImage,
  Review,
  Variant,
} from "@/lib/types";

const CATEGORY_GROUP = 1;
const PRODUCT_GROUP = 2;
const VARIANT_GROUP = 3;
const IMAGE_GROUP = 4;
const REVIEW_GROUP = 5;

export const categories: Category[] = [
  {
    id: uid(CATEGORY_GROUP, 1),
    slug: "sofas",
    name: "Sofas",
    description: "Deep seats and quiet frames for the room you actually use.",
    image: photo("photo-1555041469-a586c61ea9bc"),
  },
  {
    id: uid(CATEGORY_GROUP, 2),
    slug: "chairs",
    name: "Chairs",
    description: "Dining chairs, lounge chairs, and the one pulled up to the window.",
    image: photo("photo-1567538096630-e0c55bd6374c"),
  },
  {
    id: uid(CATEGORY_GROUP, 3),
    slug: "tables",
    name: "Tables",
    description: "Oak tops, stone, and desks with room for a lamp and a letter.",
    image: photo("photo-1530018607912-eff2daa1bac4"),
  },
  {
    id: uid(CATEGORY_GROUP, 4),
    slug: "beds",
    name: "Beds",
    description: "Low platforms and upholstered frames, built to be made every morning.",
    image: photo("photo-1505693416388-ac5ce068fe85"),
  },
  {
    id: uid(CATEGORY_GROUP, 5),
    slug: "storage",
    name: "Storage",
    description: "Bookcases, chests, and sideboards that earn their wall.",
    image: photo("photo-1594026112284-02bb6f3352fe"),
  },
  {
    id: uid(CATEGORY_GROUP, 6),
    slug: "lighting",
    name: "Lighting",
    description: "Lamps with a warm pool of light, not a showroom glare.",
    image: photo("photo-1507473885765-e6ed057f782c"),
  },
];

interface DraftVariant {
  finish: string;
  material: string;
  color: string;
  hex: string;
  price: number;
  stock: number;
}

interface DraftReview {
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
}

interface Draft {
  slug: string;
  name: string;
  category: CategorySlug;
  description: string;
  details: string[];
  createdAt: string;
  featured?: boolean;
  bestseller?: boolean;
  photos: [string, string, string, string];
  variants: DraftVariant[];
  reviews: DraftReview[];
}

const drafts: Draft[] = [
  {
    slug: "calder-lounge-sofa",
    name: "Calder Lounge Sofa",
    category: "sofas",
    description:
      "A deep three-seat sofa on a kiln-dried white oak frame. The boxed linen cushions stay square, and the arms are slim enough to sit beside a side table.",
    details: [
      "Width 86 in · Depth 38 in · Height 31 in · Seat height 17 in",
      "Kiln-dried oak frame with mortise-and-tenon joints",
      "Down-and-feather wrap over high-density foam",
      "Removable covers, dry clean",
    ],
    createdAt: "2026-02-11",
    featured: true,
    bestseller: true,
    photos: [
      "photo-1555041469-a586c61ea9bc",
      "A low green sofa in a sunlit living room",
      "photo-1550581190-9c1c48d21d6c",
      "A long sofa against a pale wall with a wooden floor",
    ],
    variants: [
      { finish: "Natural oak", material: "Linen", color: "Sage", hex: "#7d8b74", price: 2480, stock: 4 },
      { finish: "Walnut", material: "Linen", color: "Ember", hex: "#c2582a", price: 2680, stock: 2 },
      { finish: "Natural oak", material: "Boucle", color: "Ivory", hex: "#f3efe6", price: 2860, stock: 0 },
    ],
    reviews: [
      { author: "Helen Cho", rating: 5, title: "The seat is actually deep", body: "We sit sideways on it to read. The oak frame does not creak, and the sage linen looks better after a month than it did in the crate.", date: "2026-08-14" },
      { author: "Marcus Adeyemi", rating: 4, title: "Worth the wait", body: "Six weeks from order to delivery. The cushions are firm in a good way. I wish the ember linen had been in stock.", date: "2026-09-02" },
    ],
  },
  {
    slug: "ember-sectional",
    name: "Ember Sectional",
    category: "sofas",
    description:
      "A two-piece sectional with a chaise long enough for a person and a dog. The terracotta upholstery is a heavy cotton weave that hides the Tuesday of it all.",
    details: [
      "Overall 112 in · Chaise depth 64 in · Height 30 in",
      "Hardwood frame, sinuous springs",
      "Performance cotton, spot clean",
      "Pieces join with steel brackets, no tools",
    ],
    createdAt: "2026-04-02",
    featured: true,
    photos: [
      "photo-1493663284031-b7e3aefcae8e",
      "A beige sectional in a warm living room",
      "photo-1560448204-e02f11c3d0e2",
      "A bright room with a large sofa and wood floors",
    ],
    variants: [
      { finish: "Oak legs", material: "Cotton", color: "Ember", hex: "#c2582a", price: 4280, stock: 3 },
      { finish: "Blackened steel", material: "Cotton", color: "Sand", hex: "#d8c7ae", price: 4380, stock: 2 },
    ],
    reviews: [
      { author: "Priya Shah", rating: 5, title: "Holds a crowd", body: "Thanksgiving for eight, and the chaise was the prize seat. The ember color is quieter in person than the photograph.", date: "2026-07-19" },
    ],
  },
  {
    slug: "marlowe-settee",
    name: "Marlowe Settee",
    category: "sofas",
    description:
      "A tight-back settee for an entry or the foot of a bed. The seat is firmer than the lounges, and the turned oak legs keep it from looking heavy.",
    details: [
      "Width 58 in · Depth 30 in · Height 32 in",
      "Turned oak legs, unglued so they can be refinished",
      "Single boxed seat cushion",
    ],
    createdAt: "2025-11-18",
    photos: [
      "photo-1540574163026-643ea20ade25",
      "A pale sofa in a minimal room",
      "photo-1618220179428-22790b461013",
      "A styled living room with a compact sofa",
    ],
    variants: [
      { finish: "Natural oak", material: "Linen", color: "Cream", hex: "#f7f1e8", price: 1860, stock: 5 },
      { finish: "Walnut", material: "Leather", color: "Walnut", hex: "#6b4a2b", price: 2140, stock: 2 },
    ],
    reviews: [
      { author: "Jonah Ellis", rating: 5, title: "Right size for the hall", body: "People sit to take off boots. The cream linen has a couple of honest marks and still looks considered.", date: "2026-05-03" },
    ],
  },
  {
    slug: "hearth-loveseat",
    name: "Hearth Loveseat",
    category: "sofas",
    description:
      "Two seats, low arms, and a back you can lean a head against. Built for rooms that already have a fireplace and do not need another big gesture.",
    details: [
      "Width 62 in · Depth 36 in · Height 30 in",
      "Oak frame, webbing and foam",
      "Loose back cushions",
    ],
    createdAt: "2026-01-09",
    bestseller: true,
    photos: [
      "photo-1484101403633-562f891dc89a",
      "A grey loveseat in a living room",
      "photo-1600210492486-724fe5c67fb0",
      "A warm interior with a low sofa",
    ],
    variants: [
      { finish: "Natural oak", material: "Linen", color: "Sand", hex: "#d8c7ae", price: 2140, stock: 4 },
      { finish: "Walnut", material: "Boucle", color: "Ink", hex: "#241c15", price: 2360, stock: 1 },
    ],
    reviews: [
      { author: "Ruth Keller", rating: 4, title: "Low and comfortable", body: "The sand linen is the color of the floorboards, which was the point. Delivery crew was careful with the stair turn.", date: "2026-06-21" },
    ],
  },
  {
    slug: "wren-armchair",
    name: "Wren Armchair",
    category: "chairs",
    description:
      "A generous lounge chair with a pitched back and oak arms worn smooth at the front edge. It is the chair people migrate to.",
    details: [
      "Width 32 in · Depth 34 in · Height 31 in",
      "Oak arms, linen or leather seat",
      "Swivel base is not offered — the legs stay put",
    ],
    createdAt: "2026-03-14",
    featured: true,
    bestseller: true,
    photos: [
      "photo-1567538096630-e0c55bd6374c",
      "A yellow upholstered armchair",
      "photo-1586023492125-27b2c045efd7",
      "A modern armchair in a bright room",
    ],
    variants: [
      { finish: "Natural oak", material: "Linen", color: "Ember", hex: "#c2582a", price: 1280, stock: 6 },
      { finish: "Walnut", material: "Leather", color: "Walnut", hex: "#6b4a2b", price: 1540, stock: 3 },
      { finish: "Natural oak", material: "Boucle", color: "Ivory", hex: "#f3efe6", price: 1420, stock: 2 },
    ],
    reviews: [
      { author: "Andre Silva", rating: 5, title: "Replaced a reading lamp and a bad chair", body: "I read in it most nights. The ember linen is saturated without shouting, and the oak arms are the right height for a cup.", date: "2026-08-30" },
      { author: "Naomi Berg", rating: 5, title: "Ordered a second", body: "The first one lived in the study for a month. Then we ordered the ivory boucle for the bedroom.", date: "2026-09-18" },
    ],
  },
  {
    slug: "rowan-dining-chair",
    name: "Rowan Dining Chair",
    category: "chairs",
    description:
      "A spindle-back dining chair in solid oak. The seat is gently scooped, and the finish is oil, not a thick varnish, so it can be refreshed in the kitchen.",
    details: [
      "Width 19 in · Depth 21 in · Height 33 in · Seat height 18 in",
      "Solid oak, steam-bent back spindles",
      "Sold individually — order two or eight",
    ],
    createdAt: "2025-10-02",
    bestseller: true,
    photos: [
      "photo-1506439773649-6e0eb8cfb237",
      "A wooden dining chair",
      "photo-1616486338812-3dadae4b4ace",
      "A dining area with wooden chairs",
    ],
    variants: [
      { finish: "Natural oak", material: "Oak", color: "Sand", hex: "#d8c7ae", price: 420, stock: 14 },
      { finish: "Walnut stain", material: "Oak", color: "Walnut", hex: "#6b4a2b", price: 450, stock: 8 },
      { finish: "Natural oak", material: "Leather", color: "Black", hex: "#1a1a1a", price: 520, stock: 4 },
    ],
    reviews: [
      { author: "Chris Dalton", rating: 5, title: "Eight of them, no wobble", body: "We use them every night. The oil finish darkened a little where hands rest, which looks right.", date: "2026-04-11" },
    ],
  },
  {
    slug: "sable-lounge-chair",
    name: "Sable Lounge Chair",
    category: "chairs",
    description:
      "A low lounge chair with a leather sling and a blackened steel sled. It sits closer to the floor than the Wren and takes up less visual weight.",
    details: [
      "Width 28 in · Depth 32 in · Height 28 in",
      "Vegetable-tanned leather, steel frame",
      "Leather will lighten where it is sat in",
    ],
    createdAt: "2026-05-20",
    bestseller: true,
    photos: [
      "photo-1592078615290-033ee584e267",
      "A white modern lounge chair",
      "photo-1567016432779-094069958ea5",
      "A leather lounge chair in a living room",
    ],
    variants: [
      { finish: "Blackened steel", material: "Leather", color: "Ink", hex: "#241c15", price: 1680, stock: 3 },
      { finish: "Brass", material: "Leather", color: "Sand", hex: "#d8c7ae", price: 1840, stock: 2 },
    ],
    reviews: [
      { author: "Leila Hassan", rating: 4, title: "Lower than I expected", body: "Measure your coffee table. Once I swapped the table it made sense. The leather already looks lived-in, in a good week.", date: "2026-07-02" },
    ],
  },
  {
    slug: "atelier-accent-chair",
    name: "Atelier Accent Chair",
    category: "chairs",
    description:
      "A small upholstered chair with a wrapped back and rattan side panels. Useful beside a desk when someone stops to talk.",
    details: [
      "Width 24 in · Depth 26 in · Height 31 in",
      "Rattan panels, oak legs",
      "Fabric is a tight weave, not a loose boucle",
    ],
    createdAt: "2026-06-08",
    photos: [
      "photo-1598300042247-d088f8ab3a91",
      "A brown leather armchair",
      "photo-1583847268964-b28dc8f51f92",
      "A pink chair in a styled corner",
    ],
    variants: [
      { finish: "Natural oak", material: "Rattan", color: "Cream", hex: "#f7f1e8", price: 890, stock: 5 },
      { finish: "Walnut", material: "Rattan", color: "Sage", hex: "#7d8b74", price: 940, stock: 3 },
    ],
    reviews: [
      { author: "Owen Park", rating: 5, title: "The desk companion", body: "Light enough to pull over. The rattan keeps it from looking like a waiting-room chair.", date: "2026-09-09" },
    ],
  },
  {
    slug: "linden-dining-table",
    name: "Linden Dining Table",
    category: "tables",
    description:
      "An oak dining table for six, eight if people know each other. The top is a single-board look made from matched planks, with a breadboard end so it stays flat.",
    details: [
      "Length 84 in · Width 38 in · Height 30 in",
      "White oak, breadboard ends",
      "Seats six comfortably, eight with the Rowans tucked close",
      "Oil finish, food-safe",
    ],
    createdAt: "2026-01-22",
    featured: true,
    photos: [
      "photo-1530018607912-eff2daa1bac4",
      "A wooden dining table set for a meal",
      "photo-1615873968403-89e068629265",
      "A dining table in a bright apartment",
    ],
    variants: [
      { finish: "Natural oak", material: "Oak", color: "Sand", hex: "#d8c7ae", price: 2640, stock: 3 },
      { finish: "Fumed oak", material: "Oak", color: "Walnut", hex: "#6b4a2b", price: 2860, stock: 2 },
    ],
    reviews: [
      { author: "Helen Cho", rating: 5, title: "The room organized itself", body: "Once the table landed, the rest of the furniture had to behave. The top has a small knot we now use as a landmark.", date: "2026-03-29" },
      { author: "Marcus Adeyemi", rating: 5, title: "Solid, not thick for the sake of it", body: "I did not want a slab that looks like a conference table. This is the right weight.", date: "2026-06-12" },
    ],
  },
  {
    slug: "cinder-coffee-table",
    name: "Cinder Coffee Table",
    category: "tables",
    description:
      "A low table with an oak apron and a honed marble top the color of wet sand. The edge is eased so it does not bite a shin.",
    details: [
      "Length 48 in · Width 24 in · Height 15 in",
      "Honed marble over an oak frame",
      "Marble is sealed; wipe spills, do not pretend it is invincible",
    ],
    createdAt: "2026-02-28",
    bestseller: true,
    photos: [
      "photo-1494438639946-1ebd1d20bf85",
      "A round coffee table with books",
      "photo-1616046229478-9901c5536a45",
      "A living room coffee table with ceramics",
    ],
    variants: [
      { finish: "Natural oak", material: "Marble", color: "Cream", hex: "#f7f1e8", price: 980, stock: 5 },
      { finish: "Walnut", material: "Marble", color: "Ink", hex: "#241c15", price: 1120, stock: 2 },
    ],
    reviews: [
      { author: "Priya Shah", rating: 4, title: "Heavy, as marble is", body: "Two people to move it. The honed top does not glare when the afternoon sun hits the west window.", date: "2026-05-28" },
    ],
  },
  {
    slug: "grove-side-table",
    name: "Grove Side Table",
    category: "tables",
    description:
      "A three-leg side table that tucks next to the Wren. The top is round, the shelf holds a book you are not finished with.",
    details: [
      "Diameter 18 in · Height 22 in",
      "Solid oak, hand-finished",
      "Ships assembled",
    ],
    createdAt: "2025-12-04",
    photos: [
      "photo-1533090481720-856c6e3c1fdc",
      "A small white side table",
      "photo-1538688525198-9b88f6f53126",
      "A living room side table beside a sofa",
    ],
    variants: [
      { finish: "Natural oak", material: "Oak", color: "Sand", hex: "#d8c7ae", price: 540, stock: 9 },
      { finish: "Walnut", material: "Oak", color: "Walnut", hex: "#6b4a2b", price: 590, stock: 4 },
    ],
    reviews: [
      { author: "Ruth Keller", rating: 5, title: "The right height for the armchair", body: "Bought two. One holds a lamp, the other holds the remote we pretend not to need.", date: "2026-04-02" },
    ],
  },
  {
    slug: "ash-writing-desk",
    name: "Ash Writing Desk",
    category: "tables",
    description:
      "A writing desk with a leather blotter inset and a single drawer deep enough for paper, not a cable graveyard. The ash is pale and straight-grained.",
    details: [
      "Width 54 in · Depth 26 in · Height 30 in",
      "Solid ash, vegetable-tanned leather inset",
      "Drawer on soft-close runners",
      "Cable notch at the back",
    ],
    createdAt: "2026-07-01",
    featured: true,
    photos: [
      "photo-1518455027359-f3f8164ba6bd",
      "A wooden desk by a window",
      "photo-1616486029423-aaa4789e8c9a",
      "A quiet work table in a home office",
    ],
    variants: [
      { finish: "Natural ash", material: "Leather", color: "Sand", hex: "#d8c7ae", price: 1720, stock: 4 },
      { finish: "Ebonized ash", material: "Leather", color: "Ink", hex: "#241c15", price: 1840, stock: 2 },
    ],
    reviews: [
      { author: "Jonah Ellis", rating: 5, title: "I stopped working at the dining table", body: "The leather inset is the right size for a notebook and a laptop. The drawer is not a gimmick.", date: "2026-09-27" },
    ],
  },
  {
    slug: "solstice-platform-bed",
    name: "Solstice Platform Bed",
    category: "beds",
    description:
      "A low oak platform with a slatted headboard that lets the wall stay visible. No box spring. The mattress sits in a shallow recess so sheets tuck cleanly.",
    details: [
      "Queen shown · King and full available in the same frame",
      "Height to the top of the mattress deck: 10 in",
      "Solid oak, center rail, and a row of slats",
      "Headboard is part of the frame, not a bolt-on panel",
    ],
    createdAt: "2026-03-03",
    featured: true,
    bestseller: true,
    photos: [
      "photo-1505693416388-ac5ce068fe85",
      "A low white bed with linen bedding",
      "photo-1505691938895-1758d7feb511",
      "A made bed in a quiet bedroom",
    ],
    variants: [
      { finish: "Natural oak", material: "Oak", color: "Sand", hex: "#d8c7ae", price: 2480, stock: 3 },
      { finish: "Walnut", material: "Oak", color: "Walnut", hex: "#6b4a2b", price: 2720, stock: 2 },
    ],
    reviews: [
      { author: "Naomi Berg", rating: 5, title: "The room got quieter", body: "The headboard does not eat the wall. We use a 12-inch mattress and the proportion is right.", date: "2026-06-30" },
      { author: "Owen Park", rating: 4, title: "Low, so plan the mattress", body: "If you like a tall pillow-top, this will feel closer to the floor than a hotel bed. That was what we wanted.", date: "2026-08-08" },
    ],
  },
  {
    slug: "linen-shelter-bed",
    name: "Linen Shelter Bed",
    category: "beds",
    description:
      "An upholstered bed with a tall wing on either side of the headboard. The linen is a heavy oatmeal cloth over a hardwood frame.",
    details: [
      "Queen · King adds 8 in to the width of the headboard",
      "Headboard height 48 in",
      "Linen upholstery, oak legs",
    ],
    createdAt: "2026-04-16",
    photos: [
      "photo-1616594039964-ae9021a400a0",
      "A bedroom with an upholstered bed",
      "photo-1615874959474-d609969a20ed",
      "Layered bed linens in a warm bedroom",
    ],
    variants: [
      { finish: "Oak legs", material: "Linen", color: "Ivory", hex: "#f3efe6", price: 3460, stock: 2 },
      { finish: "Oak legs", material: "Linen", color: "Sage", hex: "#7d8b74", price: 3460, stock: 2 },
      { finish: "Oak legs", material: "Boucle", color: "Ember", hex: "#c2582a", price: 3680, stock: 1 },
    ],
    reviews: [
      { author: "Andre Silva", rating: 5, title: "The wings block the hallway light", body: "Our bedroom door does not close all the way. The wings fixed that better than a curtain did.", date: "2026-07-25" },
    ],
  },
  {
    slug: "low-oak-bed",
    name: "Low Oak Bed",
    category: "beds",
    description:
      "A simpler platform than the Solstice: four rails, a headboard of two planks, and nothing else. Made for a guest room that should not try too hard.",
    details: [
      "Full and queen",
      "Deck height 8 in",
      "Solid oak, oil finish",
    ],
    createdAt: "2025-09-12",
    photos: [
      "photo-1617325247661-675ab4b64ae2",
      "A warm bedroom with a wooden bed",
      "photo-1595526114035-0d45ed16cfbf",
      "A neatly made bed with white linens",
    ],
    variants: [
      { finish: "Natural oak", material: "Oak", color: "Sand", hex: "#d8c7ae", price: 1880, stock: 4 },
      { finish: "Walnut", material: "Oak", color: "Walnut", hex: "#6b4a2b", price: 2060, stock: 2 },
    ],
    reviews: [
      { author: "Chris Dalton", rating: 4, title: "Guest room, solved", body: "Assembled in an afternoon with the included wrench. Guests have not complained, which is the review that matters.", date: "2026-02-17" },
    ],
  },
  {
    slug: "nook-daybed",
    name: "Nook Daybed",
    category: "beds",
    description:
      "A daybed with a back and one arm, for a room that is a study until someone stays over. The cushion is a single piece, not three that wander.",
    details: [
      "Width 80 in · Depth 40 in · Height 32 in",
      "Oak frame, linen cushion",
      "Trundle is not included",
    ],
    createdAt: "2026-08-12",
    photos: [
      "photo-1598928506311-c55ded91a20c",
      "A daybed with cushions in a small room",
      "photo-1551298370-9d3d53740c72",
      "A sofa-bed style seat by a window",
    ],
    variants: [
      { finish: "Natural oak", material: "Linen", color: "Cream", hex: "#f7f1e8", price: 2140, stock: 3 },
      { finish: "Walnut", material: "Linen", color: "Sage", hex: "#7d8b74", price: 2260, stock: 1 },
    ],
    reviews: [
      { author: "Leila Hassan", rating: 5, title: "Office by day", body: "I nap on it shamelessly. The cushion has not slumped, and the oak arm is a decent place for a glass.", date: "2026-10-02" },
    ],
  },
  {
    slug: "archive-bookcase",
    name: "Archive Bookcase",
    category: "storage",
    description:
      "A tall bookcase with adjustable oak shelves and a back panel so paperbacks do not disappear into the wall. Five shelves, one of them fixed.",
    details: [
      "Width 36 in · Depth 14 in · Height 78 in",
      "Oak shelves, 3/4 in thick",
      "Anchors to the wall — hardware included",
    ],
    createdAt: "2026-02-02",
    featured: true,
    photos: [
      "photo-1594026112284-02bb6f3352fe",
      "A wooden shelf with books and objects",
      "photo-1558997519-83ea9252edf8",
      "Bookshelves filled with books",
    ],
    variants: [
      { finish: "Natural oak", material: "Oak", color: "Sand", hex: "#d8c7ae", price: 1480, stock: 4 },
      { finish: "Walnut", material: "Oak", color: "Walnut", hex: "#6b4a2b", price: 1620, stock: 2 },
    ],
    reviews: [
      { author: "Helen Cho", rating: 5, title: "Shelves did not bow", body: "Art books on the third shelf, novels above. A month in, still level. We anchored it, as asked.", date: "2026-05-16" },
    ],
  },
  {
    slug: "cedar-keeper-chest",
    name: "Cedar Keeper Chest",
    category: "storage",
    description:
      "A chest in aromatic cedar with an oak lid. Blankets, off-season coats, the good tablecloth. The hinge stops the lid before it hits the wall.",
    details: [
      "Width 42 in · Depth 18 in · Height 20 in",
      "Aromatic cedar body, oak lid and base",
      "Soft-close lid stay",
    ],
    createdAt: "2025-08-21",
    photos: [
      "photo-1616627451515-cbc80e5ece35",
      "A wooden storage bench at the foot of a bed",
      "photo-1616627561839-074385245ff6",
      "A bedroom chest in warm light",
    ],
    variants: [
      { finish: "Natural oak", material: "Oak", color: "Sand", hex: "#d8c7ae", price: 920, stock: 6 },
      { finish: "Walnut", material: "Oak", color: "Walnut", hex: "#6b4a2b", price: 990, stock: 3 },
    ],
    reviews: [
      { author: "Ruth Keller", rating: 5, title: "Smells like a closet should", body: "The cedar is present when you open it and gone when you close it. Lid stay is the detail I did not know to ask for.", date: "2026-01-20" },
    ],
  },
  {
    slug: "ember-sideboard",
    name: "Ember Sideboard",
    category: "storage",
    description:
      "A long sideboard with two cabinets and a row of drawers. The oak is straight, the pulls are unlacquered brass that will darken where fingers land.",
    details: [
      "Width 72 in · Depth 18 in · Height 32 in",
      "Oak case, brass pulls",
      "Adjustable shelf in each cabinet",
      "Cord pass-through if it has to hold a router",
    ],
    createdAt: "2026-05-05",
    bestseller: true,
    photos: [
      "photo-1556228453-efd6c1ff04f6",
      "A sideboard in a bright living room",
      "photo-1519710164239-da123dc03ef4",
      "A styled interior with a low cabinet",
    ],
    variants: [
      { finish: "Natural oak", material: "Brass", color: "Sand", hex: "#d8c7ae", price: 2180, stock: 3 },
      { finish: "Walnut", material: "Brass", color: "Walnut", hex: "#6b4a2b", price: 2380, stock: 2 },
    ],
    reviews: [
      { author: "Marcus Adeyemi", rating: 5, title: "The brass is already changing", body: "Two months of hands on the center pull and it looks older than the rest, which is the idea. Inside is genuinely useful.", date: "2026-08-22" },
      { author: "Priya Shah", rating: 4, title: "Long, so measure the wall", body: "We had 74 inches and it fit with a finger on each side. Do not round down.", date: "2026-09-14" },
    ],
  },
  {
    slug: "hollow-wardrobe",
    name: "Hollow Wardrobe",
    category: "storage",
    description:
      "A two-door wardrobe for a bedroom without a closet worth the name. Hanging rod on the left, shelves on the right, oak throughout.",
    details: [
      "Width 48 in · Depth 22 in · Height 76 in",
      "Hanging height 50 in",
      "Soft-close doors",
      "Must be anchored",
    ],
    createdAt: "2026-06-19",
    photos: [
      "photo-1595428774223-ef52624120d2",
      "A bedroom with a tall wooden cabinet",
      "photo-1631679706909-1844bbd07221",
      "A wardrobe wall in a calm bedroom",
    ],
    variants: [
      { finish: "Natural oak", material: "Oak", color: "Sand", hex: "#d8c7ae", price: 2640, stock: 2 },
      { finish: "Walnut", material: "Oak", color: "Walnut", hex: "#6b4a2b", price: 2840, stock: 1 },
    ],
    reviews: [
      { author: "Jonah Ellis", rating: 4, title: "Replaced a bad closet", body: "The rod height fits coats. Doors close themselves the last inch, which my previous wardrobe treated as optional.", date: "2026-10-11" },
    ],
  },
  {
    slug: "arc-floor-lamp",
    name: "Arc Floor Lamp",
    category: "lighting",
    description:
      "A brass arc lamp with a linen shade. It reaches over a sofa without a table in the way, and the marble foot keeps it honest.",
    details: [
      "Height 78 in · Reach 40 in",
      "Brass stem, marble base, linen shade",
      "E26 socket, LED recommended, bulb not included",
      "In-line dimmer on the cord",
    ],
    createdAt: "2026-03-28",
    bestseller: true,
    photos: [
      "photo-1507473885765-e6ed057f782c",
      "A brass floor lamp beside a sofa",
      "photo-1513506003901-1e6a229e2d15",
      "Warm pendant and lamp light in a living room",
    ],
    variants: [
      { finish: "Brass", material: "Brass", color: "Brass", hex: "#b08d57", price: 640, stock: 7 },
      { finish: "Blackened brass", material: "Brass", color: "Ink", hex: "#241c15", price: 680, stock: 3 },
    ],
    reviews: [
      { author: "Naomi Berg", rating: 5, title: "The shade is actually linen", body: "Warm light, not a yellow plastic glow. The foot is heavy. I have not tipped it, and I have tried accidentally.", date: "2026-06-04" },
    ],
  },
  {
    slug: "kiln-table-lamp",
    name: "Kiln Table Lamp",
    category: "lighting",
    description:
      "A ceramic lamp thrown in a small kiln, glazed the color of a clay roof. The shade is a plain drum in off-white paper.",
    details: [
      "Height with shade 22 in",
      "Stoneware base, paper shade",
      "Each base varies slightly in the glaze",
      "Bulb not included",
    ],
    createdAt: "2026-01-15",
    featured: true,
    photos: [
      "photo-1540932239986-30128078f3c5",
      "A ceramic table lamp on a wood surface",
      "photo-1578500494198-246f612d3b3d",
      "A small lamp glowing on a bedside table",
    ],
    variants: [
      { finish: "Ember glaze", material: "Ceramic", color: "Ember", hex: "#c2582a", price: 280, stock: 8 },
      { finish: "Sand glaze", material: "Ceramic", color: "Sand", hex: "#d8c7ae", price: 280, stock: 6 },
      { finish: "Ink glaze", material: "Ceramic", color: "Ink", hex: "#241c15", price: 280, stock: 2 },
    ],
    reviews: [
      { author: "Owen Park", rating: 5, title: "Bought the pair", body: "One on the desk, one by the bed. The ember glaze has a brown edge where the kiln ran hot. That one is mine.", date: "2026-04-23" },
      { author: "Leila Hassan", rating: 4, title: "Smaller than a hotel lamp", body: "Which is what I wanted on the Grove side table. Shade is easy to replace if a cat has opinions.", date: "2026-07-08" },
    ],
  },
  {
    slug: "trio-pendant",
    name: "Trio Pendant",
    category: "lighting",
    description:
      "Three opal glass pendants on brass canopies, meant to hang in a line over the Linden table. Cords are cloth-covered and can be cut to length.",
    details: [
      "Sold as a set of three",
      "Shade diameter 8 in",
      "Canopy covers a standard junction box",
      "Hardwired, dimmer-compatible LED bulbs not included",
    ],
    createdAt: "2026-04-29",
    photos: [
      "photo-1524484485831-a92ffc0de03f",
      "Glass pendant lights over a table",
      "photo-1617103996702-96ff29b1c467",
      "A cluster of warm pendant lights",
    ],
    variants: [
      { finish: "Brass", material: "Brass", color: "Brass", hex: "#b08d57", price: 520, stock: 5 },
      { finish: "Blackened brass", material: "Brass", color: "Black", hex: "#1a1a1a", price: 540, stock: 4 },
    ],
    reviews: [
      { author: "Chris Dalton", rating: 5, title: "Over the table, finally", body: "An electrician hung them in an hour. The opal glass hides the bulb and still throws enough light to see a plate.", date: "2026-08-01" },
    ],
  },
  {
    slug: "alcove-sconce",
    name: "Alcove Sconce",
    category: "lighting",
    description:
      "A pair of wall sconces with a short brass arm and a small linen shade. For either side of the Solstice, or a hallway that has been overhead-lit for too long.",
    details: [
      "Sold as a pair",
      "Projection 8 in · Shade width 6 in",
      "Hardwired",
      "Backplate covers a standard box",
    ],
    createdAt: "2026-09-01",
    photos: [
      "photo-1581539250439-c96689b516dd",
      "A wall sconce lighting a hallway",
      "photo-1519710164239-da123dc03ef4",
      "Warm light in a furnished room",
    ],
    variants: [
      { finish: "Brass", material: "Brass", color: "Brass", hex: "#b08d57", price: 360, stock: 6 },
      { finish: "Blackened brass", material: "Linen", color: "Ink", hex: "#241c15", price: 380, stock: 4 },
    ],
    reviews: [
      { author: "Andre Silva", rating: 5, title: "Bedside without the tables crowded", body: "We still have the Grove tables, but the lamps moved to the desk. These do the reading.", date: "2026-10-20" },
    ],
  },
];

function photo(id: string) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1800&q=80`;
}

function skuFor(slug: string, index: number) {
  const base = slug
    .split("-")
    .map((part) => part.slice(0, 3))
    .join("")
    .toUpperCase();
  return `${base}-${String(index + 1).padStart(2, "0")}`;
}

let variantCounter = 0;
let imageCounter = 0;
let reviewCounter = 0;

function buildProduct(draft: Draft, index: number): Product {
  const variants: Variant[] = draft.variants.map((variant, variantIndex) => {
    variantCounter += 1;
    return {
      id: uid(VARIANT_GROUP, variantCounter),
      sku: skuFor(draft.slug, variantIndex),
      finish: variant.finish,
      material: variant.material,
      color: variant.color,
      colorHex: variant.hex,
      priceCents: variant.price * 100,
      stock: variant.stock,
    };
  });
  const images: ProductImage[] = [0, 1].map((imageIndex) => {
    imageCounter += 1;
    const id = draft.photos[imageIndex * 2];
    const alt = draft.photos[imageIndex * 2 + 1];
    return {
      id: uid(IMAGE_GROUP, imageCounter),
      src: photo(id),
      alt,
      credit: `https://unsplash.com/${id}`,
    };
  });
  const reviews: Review[] = draft.reviews.map((review) => {
    reviewCounter += 1;
    return {
      id: uid(REVIEW_GROUP, reviewCounter),
      author: review.author,
      rating: review.rating,
      title: review.title,
      body: review.body,
      createdAt: review.date,
    };
  });
  const priceCents = Math.min(...variants.map((variant) => variant.priceCents));
  return {
    id: uid(PRODUCT_GROUP, index + 1),
    slug: draft.slug,
    name: draft.name,
    category: draft.category,
    description: draft.description,
    details: draft.details,
    priceCents,
    featured: Boolean(draft.featured),
    bestseller: Boolean(draft.bestseller),
    createdAt: draft.createdAt,
    images,
    variants,
    reviews,
  };
}

export const products: Product[] = drafts.map(buildProduct);

export function categoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function productBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export const HERO_VIDEO = {
  src: "/hero.mp4",
  poster: "/hero-poster.jpg",
  title: "Interior Design of a Living Room",
  author: "Max Vakhtbovych",
  source: "https://www.pexels.com/video/interior-design-of-a-living-room-7239166/",
  license: "https://www.pexels.com/license/",
};
