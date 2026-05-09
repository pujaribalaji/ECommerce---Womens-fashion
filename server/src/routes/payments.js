import express from "express";
import crypto from "node:crypto";
import Razorpay from "razorpay";
import { z } from "zod";

export const paymentsRouter = express.Router();

function toErrorMessage(err) {
  if (!err) return "Unknown error";
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID || "";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "";
  if (!key_id || !key_secret) {
    throw new Error("Missing RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET in server/.env");
  }
  // Helpful diagnostics without leaking secrets
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[razorpay] using key_id=${key_id.slice(0, 12)}… secretLen=${key_secret.length}`
    );
  }
  return new Razorpay({ key_id, key_secret });
}

// Create a Razorpay order for a given amount.
paymentsRouter.post("/razorpay/order", async (req, res) => {
  const schema = z.object({
    amountInr: z.number().positive(), // INR rupees
    receipt: z.string().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  try {
    const rzp = getRazorpay();
    const order = await rzp.orders.create({
      amount: Math.round(parsed.data.amountInr * 100), // paise
      currency: "INR",
      receipt: parsed.data.receipt
    });

    res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (err) {
    // Razorpay sometimes rejects with a plain object; never crash the process.
    console.error("Razorpay order create failed:", err);
    return res.status(502).json({
      error: "Razorpay error",
      detail: toErrorMessage(err)
    });
  }
});

// Verify signature from client.
paymentsRouter.post("/razorpay/verify", async (req, res) => {
  const schema = z.object({
    razorpay_order_id: z.string().min(1),
    razorpay_payment_id: z.string().min(1),
    razorpay_signature: z.string().min(1)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  try {
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    if (!secret) return res.status(500).json({ error: "Server misconfigured" });

    const body = `${parsed.data.razorpay_order_id}|${parsed.data.razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
    const ok = expected === parsed.data.razorpay_signature;

    res.json({ ok });
  } catch (err) {
    console.error("Razorpay verify failed:", err);
    return res.status(500).json({ error: "Verify failed", detail: toErrorMessage(err) });
  }
});

