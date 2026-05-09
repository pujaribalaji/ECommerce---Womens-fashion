import express from "express";
import { SiteSettings } from "../models/SiteSettings.js";
import { mergeSiteSettings } from "../lib/siteDefaults.js";

export const siteRouter = express.Router();

siteRouter.get("/", async (_req, res) => {
  const doc = await SiteSettings.findOne({ key: "main" }).lean();
  const saved = doc?.content && typeof doc.content === "object" ? doc.content : {};
  res.json({ settings: mergeSiteSettings(saved) });
});
