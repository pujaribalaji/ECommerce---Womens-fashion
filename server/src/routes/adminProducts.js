import express from "express";
import slugify from "slugify";
import { z } from "zod";
import { Product } from "../models/Product.js";
import { requireAdmin } from "../lib/admin.js";

export const adminProductsRouter = express.Router();

adminProductsRouter.use(requireAdmin);

const baseSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  category: z.string().min(2),
  collectionSlug: z.string().min(2),
  priceInr: z.number().nonnegative(),
  mrpInr: z.number().nonnegative(),
  images: z
    .array(
      z.union([
        z.string().url(),
        z.string().regex(/^\/uploads\/[A-Za-z0-9._-]+$/)
      ])
    )
    .min(1),
  sizes: z
    .array(z.enum(["M", "L", "XL", "XXL", "XXXL"]))
    .optional()
    .default(["M", "L", "XL", "XXL", "XXXL"]),
  badges: z.array(z.string()).optional().default([]),
  fabric: z.string().optional().default(""),
  fit: z.string().optional().default(""),
  care: z.string().optional().default(""),
  inStock: z.boolean().optional().default(true)
});

adminProductsRouter.post("/", async (req, res) => {
  const parsed = baseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const slug = slugify(parsed.data.name, { lower: true, strict: true });
  const created = await Product.create({ ...parsed.data, slug });
  res.json({ item: created });
});

adminProductsRouter.patch("/:id", async (req, res) => {
  const parsed = baseSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const update = { ...parsed.data };
  if (update.name) update.slug = slugify(update.name, { lower: true, strict: true });

  const item = await Product.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json({ item });
});

adminProductsRouter.delete("/:id", async (req, res) => {
  const item = await Product.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

