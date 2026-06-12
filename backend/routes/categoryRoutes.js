import { Router } from "express";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

// GET /api/categories — with product counts
router.get("/", async (req, res, next) => {
  try {
    const categories = await Category.find({}).sort("name").lean();
    const counts = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
    res.json({ categories: categories.map((c) => ({ ...c, productCount: countMap[c._id.toString()] || 0 })) });
  } catch (err) { next(err); }
});

router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.slug && body.name) body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const category = await Category.create(body);
    res.status(201).json({ category });
  } catch (err) { next(err); }
});

router.put("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ category });
  } catch (err) { next(err); }
});

router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const inUse = await Product.countDocuments({ category: req.params.id });
    if (inUse) return res.status(400).json({ message: `Cannot delete: ${inUse} product(s) use this category` });
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) { next(err); }
});

export default router;
