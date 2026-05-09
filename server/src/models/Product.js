import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    collectionSlug: { type: String, required: true, index: true },
    priceInr: { type: Number, required: true, min: 0 },
    mrpInr: { type: Number, required: true, min: 0 },
    images: [{ type: String, required: true }],
    sizes: {
      type: [String],
      default: ["M", "L", "XL", "XXL", "XXXL"]
    },
    badges: [{ type: String }],
    fabric: { type: String, default: "" },
    fit: { type: String, default: "" },
    care: { type: String, default: "" },
    inStock: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);

