import { Router } from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

// GET /api/products?category=slug&q=&sort=&page=&limit=&includeInactive=
router.get("/", async (req, res, next) => {
  try {
    const { category, q, sort = "featured", page = 1, limit = 24, includeInactive } = req.query;
    const filter = {};
    if (!(includeInactive === "true")) filter.isActive = true;
    if (category && category !== "all") {
      const cat = await Category.findOne({ slug: category });
      if (!cat) return res.json({ products: [], total: 0, pages: 0 });
      filter.category = cat._id;
    }
    if (q) filter.title = { $regex: q, $options: "i" };

    const sorts = {
      featured: { sold: -1, createdAt: -1 },
      newest: { createdAt: -1 },
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      rating: { rating: -1 },
      name: { title: 1 },
    };
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort(sorts[sort] || sorts.featured)
      .skip((page - 1) * limit)
      .limit(+limit);
    res.json({ products, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// GET /api/products/:slug
router.get("/:slug", async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate("category", "name slug");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) { next(err); }
});

// ---- admin CRUD ----
router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.slug && body.title) {
      body.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }
    const product = await Product.create(body);
    res.status(201).json({ product });
  } catch (err) { next(err); }
});

router.put("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) { next(err); }
});

router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) { next(err); }
});

export default router;
