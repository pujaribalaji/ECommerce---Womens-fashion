import { validateAdminKey } from "./adminAuth.js";

export async function requireAdmin(req, res, next) {
  try {
    const ok = await validateAdminKey(req.header("x-admin-key") || "");
    if (!ok) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Admin check failed" });
  }
}
