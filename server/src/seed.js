import "dotenv/config";
import slugify from "slugify";
import { connectDb } from "./db.js";
import { Collection } from "./models/Collection.js";
import { Product } from "./models/Product.js";

const MONGODB_URI = process.env.MONGODB_URI || "";

const collections = [
  {
    name: "Summer Loom",
    slug: "summer-loom",
    description: "Breathable cottons, airy silhouettes, sun-warmed tones.",
    heroImage:
      "https://images.unsplash.com/photo-1520975958225-3d6c4f51f725?auto=format&fit=crop&w=1600&q=80"
  },
  {
    name: "Indigo Atelier",
    slug: "indigo-atelier",
    description: "Deep indigos, hand-feel textures, modern craft.",
    heroImage:
      "https://images.unsplash.com/photo-1485963631004-f2f00b1d6606?auto=format&fit=crop&w=1600&q=80"
  },
  {
    name: "Festive Edit",
    slug: "festive-edit",
    description: "Statement sets and elegant layers for celebrations.",
    heroImage:
      "https://images.unsplash.com/photo-1520975693413-bc0b4d6bb5cd?auto=format&fit=crop&w=1600&q=80"
  }
];

const sampleProducts = [
  {
    name: "Gold-Edge Cotton Kurta",
    description:
      "A refined cotton kurta with subtle gold-edge detailing—light, polished, and made to move.",
    category: "Kurtas",
    collectionSlug: "summer-loom",
    priceInr: 1799,
    mrpInr: 2199,
    images: [
      "https://images.unsplash.com/photo-1520975958225-3d6c4f51f725?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520975897860-43c1d50a1d11?auto=format&fit=crop&w=1200&q=80"
    ],
    badges: ["Bestseller"],
    fabric: "100% Cotton",
    fit: "Relaxed",
    care: "Machine wash cold. Dry in shade."
  },
  {
    name: "Indigo Block-Print Dress",
    description:
      "An easy midi dress in inky indigo hues with block-inspired geometry and soft drape.",
    category: "Dresses",
    collectionSlug: "indigo-atelier",
    priceInr: 2499,
    mrpInr: 2999,
    images: [
      "https://images.unsplash.com/photo-1520975913901-2762e6d1c7b7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1485963631004-f2f00b1d6606?auto=format&fit=crop&w=1200&q=80"
    ],
    badges: ["New"],
    fabric: "Cotton Blend",
    fit: "Easy",
    care: "Hand wash recommended."
  },
  {
    name: "Festive Silk-Feel Dupatta",
    description:
      "A luminous dupatta with silk-feel texture—adds instant celebration to any look.",
    category: "Dupattas",
    collectionSlug: "festive-edit",
    priceInr: 1299,
    mrpInr: 1599,
    images: [
      "https://images.unsplash.com/photo-1520975741409-8b8d96e65e6a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520975693413-bc0b4d6bb5cd?auto=format&fit=crop&w=1200&q=80"
    ],
    badges: ["Limited"],
    fabric: "Silk-feel viscose",
    fit: "One size",
    care: "Dry clean only."
  }
];

function withSlug(p) {
  const slug = slugify(p.name, { lower: true, strict: true });
  return { ...p, slug };
}

async function main() {
  if (!MONGODB_URI) throw new Error("Missing MONGODB_URI in server/.env");
  await connectDb(MONGODB_URI);

  await Collection.deleteMany({});
  await Product.deleteMany({});

  await Collection.insertMany(collections);
  await Product.insertMany(sampleProducts.map(withSlug));

  console.log("Seeded collections/products.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

