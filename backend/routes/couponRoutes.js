import { Router } from "express";
import Coupon from "../models/Coupon.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

// POST /api/coupons/validate { code, subtotal }
router.post("/validate", protect, async (req, res, next) => {
  try {
    const { code, subtotal = 0 } = req.body;
    const coupon = await Coupon.findOne({ code: (code || "").toUpperCase() });
    if (!coupon) return res.status(404).json({ message: "Invalid coupon code" });
    const error = coupon.validateFor(subtotal);
    if (error) return res.status(400).json({ message: error });
    res.json({
      code: coupon.code, type: coupon.type, value: coupon.value,
      discount: coupon.discountFor(subtotal),
    });
  } catch (err) { next(err); }
});

// ---- admin CRUD ----
router.get("/", protect, adminOnly, async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort("-createdAt");
    res.json({ coupons });
  } catch (err) { next(err); }
});

router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ coupon });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Coupon code already exists" });
    next(err);
  }
});

router.put("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({ coupon });
  } catch (err) { next(err); }
});

router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon deleted" });
  } catch (err) { next(err); }
});

export default router;
