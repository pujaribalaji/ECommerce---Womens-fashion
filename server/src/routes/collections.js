import express from "express";
import { Collection } from "../models/Collection.js";

export const collectionsRouter = express.Router();

collectionsRouter.get("/", async (_req, res) => {
  const items = await Collection.find({}).sort({ updatedAt: -1 });
  res.json({ items });
});

