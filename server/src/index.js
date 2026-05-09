import "dotenv/config";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { connectDb } from "./db.js";
import { productsRouter } from "./routes/products.js";
import { collectionsRouter } from "./routes/collections.js";
import { paymentsRouter } from "./routes/payments.js";
import { ordersRouter } from "./routes/orders.js";
import { adminProductsRouter } from "./routes/adminProducts.js";
import { adminUploadsRouter } from "./routes/adminUploads.js";
import { siteRouter } from "./routes/site.js";
import { adminSiteRouter } from "./routes/adminSite.js";
import { adminExtrasRouter } from "./routes/adminExtras.js";
import { publicContactRouter } from "./routes/publicContact.js";
import path from "node:path";

const app = express();

const PORT = Number(process.env.PORT || 4000);
const MONGODB_URI = process.env.MONGODB_URI || "";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "https://aarnika-frontend.vercel.app/";

app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: [CLIENT_ORIGIN],
    credentials: true
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "aarnika-server" });
});

app.use("/api/collections", collectionsRouter);
app.use("/api/products", productsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminExtrasRouter);
app.use("/api/public", publicContactRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/uploads", adminUploadsRouter);
app.use("/api/site", siteRouter);
app.use("/api/admin/site", adminSiteRouter);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal error" });
});

async function main() {
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in server/.env");
  }
  await connectDb(MONGODB_URI);
  app.listen(PORT, () => console.log(`API on :${PORT}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

