import mongoose from "mongoose";

export const ORDER_STATUSES = ["pending", "processing", "shipped", "out-for-delivery", "delivered", "cancelled"];

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        title: { type: String, required: true },
        image: { type: String, default: "" },
        price: { type: Number, required: true },
        qty: { type: Number, required: true, min: 1 },
      },
    ],
    shippingAddress: {
      fullName: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      postcode: String,
      country: String,
    },
    paymentMethod: { type: String, required: true, default: "cod" },
    paymentResult: {
      provider: String,
      transactionId: String,
      status: String,
      paidAt: Date,
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    status: { type: String, enum: ORDER_STATUSES, default: "processing" },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES },
        note: String,
        at: { type: Date, default: Date.now },
      },
    ],
    trackingNumber: { type: String, default: "" },
    deliveredAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
