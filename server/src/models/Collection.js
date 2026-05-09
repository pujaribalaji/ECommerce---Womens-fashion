import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    heroImage: { type: String, required: true }
  },
  { timestamps: true }
);

export const Collection = mongoose.model("Collection", collectionSchema);

