import { Router } from "express";
import Wishlist from "../models/Wishlist.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

async function getOrCreate(userId) {
  let list = await Wishlist.findOne({ user: userId });
  if (!list) list = await Wishlist.create({ user: userId, products: [] });
  return list;
}

// GET /api/wishlist
router.get("/", async (req, res, next) => {
  try {
    const list = await getOrCreate(req.user._id);
    await list.populate({ path: "products", populate: { path: "category", select: "name slug" } });
    res.json({ wishlist: list });
  } catch (err) { next(err); }
});

// POST /api/wishlist/:productId — toggle
router.post("/:productId", async (req, res, next) => {
  try {
    const list = await getOrCreate(req.user._id);
    const idx = list.products.findIndex((p) => p.toString() === req.params.productId);
    if (idx >= 0) list.products.splice(idx, 1);
    else list.products.push(req.params.productId);
    await list.save();
    res.json({ productIds: list.products, added: idx < 0 });
  } catch (err) { next(err); }
});

export default router;
