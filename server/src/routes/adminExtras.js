import express from "express";
import { z } from "zod";
import { Order } from "../models/Order.js";
import { requireAdmin } from "../lib/admin.js";
import { setStoredAdminSecret } from "../lib/adminAuth.js";

export const adminExtrasRouter = express.Router();

adminExtrasRouter.post("/recover-key", async (req, res) => {
  const parsed = z
    .object({
      resetSecret: z.string().min(1),
      newKey: z.string().min(8).max(200)
    })
    .safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const expected = process.env.ADMIN_RESET_SECRET || "";
  if (!expected || parsed.data.resetSecret !== expected) {
    return res.status(403).json({ error: "Forbidden" });
  }

  await setStoredAdminSecret(parsed.data.newKey);
  res.json({ ok: true });
});

adminExtrasRouter.put("/secret", requireAdmin, async (req, res) => {
  const parsed = z.object({ newKey: z.string().min(8).max(200) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });
  await setStoredAdminSecret(parsed.data.newKey);
  res.json({ ok: true });
});

adminExtrasRouter.get("/analytics", requireAdmin, async (_req, res) => {
  const items = await Order.find({}).lean();
  /** @type {Record<string, number>} */
  const byStatus = {};
  let revenueInr = 0;
  for (const o of items) {
    byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    if (!["cancelled", "failed"].includes(o.status)) revenueInr += o.totals?.total ?? 0;
  }
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const last7Days = items.filter((o) => new Date(o.createdAt).getTime() >= cutoff).length;
  /** @type {Record<string, number>} */
  const byChannel = {};
  for (const o of items) {
    const ch = o.channel || "website";
    byChannel[ch] = (byChannel[ch] || 0) + 1;
  }
  res.json({
    totalOrders: items.length,
    revenueInr,
    byStatus,
    last7Days,
    byChannel
  });
});
