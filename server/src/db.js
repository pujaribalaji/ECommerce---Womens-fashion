import mongoose from "mongoose";

export async function connectDb(mongoUri) {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(mongoUri);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const looksLikeSrvDns =
      msg.includes("querySrv") || msg.includes("_mongodb._tcp") || msg.includes("ENOTFOUND") || msg.includes("ECONNREFUSED");

    if (looksLikeSrvDns && mongoUri.startsWith("mongodb+srv://")) {
      // eslint-disable-next-line no-console
      console.error(
        [
          "MongoDB connection failed due to SRV DNS lookup.",
          "",
          "Fix options:",
          "1) Use a local MongoDB URI: mongodb://127.0.0.1:27017/aarnika",
          "2) In MongoDB Atlas, choose 'Connect' -> 'Drivers' -> 'Standard connection string' (mongodb://...) and use that in MONGODB_URI",
          "3) Change DNS to 1.1.1.1 / 8.8.8.8 or try a different network (some networks block SRV lookups)."
        ].join("\n")
      );
    }
    throw err;
  }
}

