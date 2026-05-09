import express from "express";
import { z } from "zod";
import { Order } from "../models/Order.js";
import { requireAdmin } from "../lib/admin.js";
import { buildOwnerNotifyUrl } from "../lib/ownerWhatsApp.js";

export const ordersRouter = express.Router();

const createSchema = z.object({
  customer: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().min(6),
    email: z.string().email(),
    address: z.string().min(4),
    landmark: z.string().optional().default(""),
    city: z.string().min(2),
    state: z.string().optional().default(""),
    pin: z.string().min(4)
  }),
  lines: z
    .array(
      z.object({
        productId: z.string().min(1),
        name: z.string().min(1),
        slug: z.string().min(1),
        priceInr: z.number().nonnegative(),
        size: z.string().min(1),
        qty: z.number().int().min(1),
        imageUrl: z.string().optional().default("")
      })
    )
    .min(1),
  totals: z.object({
    mrp: z.number().nonnegative(),
    total: z.number().nonnegative(),
    savings: z.number().nonnegative()
  }),
  channel: z.enum(["website", "whatsapp_intent"]).optional().default("website"),
  payment: z.discriminatedUnion("provider", [
    z.object({
      provider: z.literal("razorpay"),
      razorpayOrderId: z.string().min(1),
      razorpayPaymentId: z.string().min(1),
      razorpaySignature: z.string().min(1)
    }),
    z.object({
      provider: z.literal("cod")
    })
  ])
});

function newOrderNo() {
  // Short, human-friendly (not sequentially predictable enough for demo)
  return `AAR-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now().toString().slice(-6)}`;
}

// Customer checkout creates an order after payment verify
ordersRouter.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const status = parsed.data.payment.provider === "razorpay" ? "paid" : "created";
  const { channel, ...rest } = parsed.data;

  const order = await Order.create({
    ...rest,
    channel,
    orderNo: newOrderNo(),
    status
  });

  const ownerNotifyUrl = buildOwnerNotifyUrl(order.toObject());

  res.json({
    orderId: order._id,
    orderNo: order.orderNo,
    ownerNotifyUrl
  });
});

// Admin
ordersRouter.get("/", requireAdmin, async (_req, res) => {
  const items = await Order.find({}).sort({ createdAt: -1 }).limit(200);
  res.json({ items });
});

ordersRouter.get("/:id", requireAdmin, async (req, res) => {
  const item = await Order.findById(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json({ item });
});

ordersRouter.patch("/:id/status", requireAdmin, async (req, res) => {
  const schema = z.object({
    status: z.enum(["created", "paid", "packed", "shipped", "delivered", "cancelled", "failed"])
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const item = await Order.findByIdAndUpdate(
    req.params.id,
    { $set: { status: parsed.data.status } },
    { new: true }
  );
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json({ item });
});

