import { Router } from "express";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

// GET /api/reviews/product/:productId — approved reviews
router.get("/product/:productId", async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, status: "approved" })
      .populate("user", "name")
      .sort("-createdAt");
    res.json({ reviews });
  } catch (err) { next(err); }
});

// POST /api/reviews — create (goes to moderation)
router.post("/", protect, async (req, res, next) => {
  try {
    const { product, rating, comment } = req.body;
    if (!product || !rating || !comment) return res.status(400).json({ message: "Rating and comment are required" });
    const existing = await Review.findOne({ user: req.user._id, product });
    if (existing) return res.status(409).json({ message: "You have already reviewed this product" });
    const hasBought = await Order.exists({ user: req.user._id, "items.product": product, status: { $ne: "cancelled" } });
    if (!hasBought) return res.status(403).json({ message: "You can only review products you have ordered" });
    const review = await Review.create({ user: req.user._id, product, rating, comment });
    res.status(201).json({ review, message: "Review submitted — it will appear once approved" });
  } catch (err) { next(err); }
});

// ---- admin moderation ----
// GET /api/reviews?status=pending
router.get("/", protect, adminOnly, async (req, res, next) => {
  try {
    const { status = "all" } = req.query;
    const filter = status === "all" ? {} : { status };
    const reviews = await Review.find(filter)
      .populate("user", "name email")
      .populate("product", "title slug images")
      .sort("-createdAt");
    res.json({ reviews });
  } catch (err) { next(err); }
});

// PUT /api/reviews/:id/moderate { status: approved|rejected }
router.put("/:id/moderate", protect, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) return res.status(400).json({ message: "Invalid status" });
    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!review) return res.status(404).json({ message: "Review not found" });
    await Review.syncProductRating(review.product);
    res.json({ review });
  } catch (err) { next(err); }
});

// DELETE /api/reviews/:id
router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    await Review.syncProductRating(review.product);
    res.json({ message: "Review deleted" });
  } catch (err) { next(err); }
});

export default router;
