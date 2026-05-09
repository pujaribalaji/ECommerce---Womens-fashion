import express from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { requireAdmin } from "../lib/admin.js";

export const adminUploadsRouter = express.Router();

adminUploadsRouter.use(requireAdmin);

const uploadDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = [".png", ".jpg", ".jpeg", ".webp"].includes(ext) ? ext : ".bin";
    const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${safeExt}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB each
  fileFilter: (_req, file, cb) => {
    const ok = ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Only png/jpg/webp allowed"), ok);
  }
});

adminUploadsRouter.post("/", upload.array("images", 10), (req, res) => {
  const files = Array.isArray(req.files) ? req.files : [];
  const origin = `${req.protocol}://${req.get("host")}`;
  const urls = files.map((f) => `${origin}/uploads/${f.filename}`);
  res.json({ urls });
});

