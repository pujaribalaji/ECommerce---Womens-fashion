import { AdminSecret } from "../models/AdminSecret.js";

/**
 * Validates x-admin-key against Mongo-backed secret if set,
 * otherwise against ADMIN_KEY env. Both may match during migration.
 */
export async function validateAdminKey(headerValue) {
  const got = String(headerValue || "").trim();
  if (!got) return false;
  const envKey = process.env.ADMIN_KEY || "";
  const doc = await AdminSecret.findOne({ key: "main" }).lean();
  const stored = typeof doc?.secret === "string" ? doc.secret : "";
  if (stored.length > 0) {
    return got === stored || (envKey.length > 0 && got === envKey);
  }
  return envKey.length > 0 && got === envKey;
}

export async function setStoredAdminSecret(newSecret) {
  await AdminSecret.findOneAndUpdate(
    { key: "main" },
    { $set: { secret: newSecret } },
    { upsert: true }
  );
}
