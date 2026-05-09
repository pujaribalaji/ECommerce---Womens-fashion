import express from "express";
import { z } from "zod";
import { Product } from "../models/Product.js";

export const productsRouter = express.Router();

productsRouter.get("/", async (req, res) => {
  const querySchema = z.object({
    q: z.string().optional(),
    collection: z.string().optional(),
    category: z.string().optional(),
    sort: z.enum(["featured", "price-asc", "price-desc", "new"]).optional()
  });

  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid query" });
  const { q, collection, category, sort } = parsed.data;

  const filter = {};
  if (collection) filter.collectionSlug = collection;
  if (category) filter.category = category;
  if (q) filter.name = { $regex: q, $options: "i" };

  let cursor = Product.find(filter);
  if (sort === "price-asc") cursor = cursor.sort({ priceInr: 1 });
  if (sort === "price-desc") cursor = cursor.sort({ priceInr: -1 });
  if (sort === "new") cursor = cursor.sort({ createdAt: -1 });
  if (!sort || sort === "featured") cursor = cursor.sort({ updatedAt: -1 });

  const items = await cursor.limit(60);
  res.json({ items });
});

productsRouter.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  const item = await Product.findOne({ slug });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json({ item });
});

