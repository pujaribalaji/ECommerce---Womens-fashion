import mongoose from "mongoose";

const adminSecretSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    secret: { type: String, default: "" }
  },
  { timestamps: true }
);

export const AdminSecret = mongoose.model("AdminSecret", adminSecretSchema);
