import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    minSpend: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.methods.validateFor = function (subtotal) {
  if (!this.isActive) return "This coupon is no longer active.";
  if (this.expiresAt && this.expiresAt < new Date()) return "This coupon has expired.";
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) return "This coupon has reached its usage limit.";
  if (subtotal < this.minSpend) return `Minimum spend of £${this.minSpend.toFixed(2)} required.`;
  return null;
};

couponSchema.methods.discountFor = function (subtotal) {
  const amount = this.type === "percent" ? (subtotal * this.value) / 100 : this.value;
  return Math.min(Math.round(amount * 100) / 100, subtotal);
};

export default mongoose.model("Coupon", couponSchema);
