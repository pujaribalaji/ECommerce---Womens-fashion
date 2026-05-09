import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true, index: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  { timestamps: true }
);

export const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);
