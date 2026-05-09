import express from "express";
import { z } from "zod";
import { SiteSettings } from "../models/SiteSettings.js";
import { mergeSiteSettings, SITE_DEFAULTS } from "../lib/siteDefaults.js";
import { requireAdmin } from "../lib/admin.js";

export const adminSiteRouter = express.Router();
adminSiteRouter.use(requireAdmin);

const navItem = z.object({ label: z.string().min(1), path: z.string().min(1) });
const footerLink = z.object({ label: z.string().min(1), path: z.string().optional().default("") });
const chip = z.object({
  text: z.string().min(1),
  variant: z.enum(["default", "gold"]).default("default")
});
const slide = z.object({
  imageUrl: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().default(""),
  path: z.string().min(1)
});
const siteSchema = z.object({
  brand: z.object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    showLogoMark: z.boolean().optional().default(true)
  }),
  header: z.object({
    navItems: z.array(navItem).min(1),
    searchPlaceholder: z.string().min(1)
  }),
  hero: z.object({
    chips: z.array(chip).max(8),
    titleBefore: z.string().min(1),
    titleHighlight: z.string().min(1),
    titleAfter: z.string().min(1),
    subtitle: z.string().min(1),
    primaryCta: z.object({ label: z.string().min(1), path: z.string().min(1) }),
    secondaryCta: z.object({ label: z.string().min(1), path: z.string().min(1) }),
    features: z
      .array(z.object({ title: z.string().min(1), description: z.string().min(1) }))
      .max(8),
    rightPanel: z.object({
      mode: z.enum(["collections", "custom"]),
      maxSlides: z.number().int().min(1).max(12).optional().default(6),
      customSlides: z.array(slide).max(12)
    })
  }),
  curated: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    shopAllLabel: z.string().min(1),
    gridCount: z.number().int().min(1).max(6).optional().default(3)
  }),
  footer: z.object({
    brandLine: z.string().min(1),
    blurb: z.string().min(1),
    helpTitle: z.string().min(1),
    helpLinks: z.array(footerLink).max(20),
    companyTitle: z.string().min(1),
    companyLinks: z.array(footerLink).max(20),
    copyrightSuffix: z.string().min(1)
  })
});

adminSiteRouter.get("/", async (_req, res) => {
  const doc = await SiteSettings.findOne({ key: "main" }).lean();
  const saved = doc?.content && typeof doc.content === "object" ? doc.content : {};
  res.json({ settings: mergeSiteSettings(saved) });
});

adminSiteRouter.put("/", async (req, res) => {
  const parsed = siteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid site settings", issues: parsed.error.flatten() });
  }
  await SiteSettings.findOneAndUpdate(
    { key: "main" },
    { $set: { content: parsed.data } },
    { upsert: true, new: true }
  );
  res.json({ ok: true, settings: mergeSiteSettings(parsed.data) });
});

/** Reset to built-in defaults (optional helper). */
adminSiteRouter.post("/reset", async (_req, res) => {
  await SiteSettings.findOneAndUpdate(
    { key: "main" },
    { $set: { content: structuredClone(SITE_DEFAULTS) } },
    { upsert: true, new: true }
  );
  res.json({ ok: true, settings: mergeSiteSettings(SITE_DEFAULTS) });
});
