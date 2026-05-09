import mongoose from "mongoose";

const lineSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    priceInr: { type: Number, required: true, min: 0 },
    size: { type: String, default: "M" },
    qty: { type: Number, required: true, min: 1 },
    /** Product image URL as shown to the customer when the order was placed. */
    imageUrl: { type: String, default: "" }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNo: { type: String, required: true, unique: true, index: true },
    customer: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      landmark: { type: String, default: "", trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, default: "", trim: true },
      pin: { type: String, required: true, trim: true }
    },
    lines: { type: [lineSchema], required: true },
    totals: {
      mrp: { type: Number, required: true, min: 0 },
      total: { type: Number, required: true, min: 0 },
      savings: { type: Number, required: true, min: 0 }
    },
    status: {
      type: String,
      enum: ["created", "paid", "packed", "shipped", "delivered", "cancelled", "failed"],
      default: "created",
      index: true
    },
    payment: {
      provider: { type: String, enum: ["razorpay", "cod"], required: true },
      razorpayOrderId: { type: String, default: "" },
      razorpayPaymentId: { type: String, default: "" },
      razorpaySignature: { type: String, default: "" }
    },
    channel: {
      type: String,
      enum: ["website", "whatsapp_intent"],
      default: "website"
    }
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);

