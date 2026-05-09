import express from "express";

export const publicContactRouter = express.Router();

/** Public store contact helpers (no secrets). */
publicContactRouter.get("/contact", (_req, res) => {
  const raw = process.env.OWNER_WHATSAPP || "";
  const digits = raw.replace(/\D/g, "");
  res.json({
    ownerWhatsAppDigits: digits || null,
    hasOwnerWhatsApp: Boolean(digits)
  });
});
