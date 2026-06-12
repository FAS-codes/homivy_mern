import { Router } from "express";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();
router.use(protect, adminOnly);

// GET /api/admin/analytics — dashboard cards + charts
router.get("/analytics", async (req, res, next) => {
  try {
    const validOrders = { status: { $ne: "cancelled" } };
    const [totalOrders, totalCustomers, totalProducts, pendingReviews, revenueAgg, statusAgg, lowStock, recentOrders, topProducts] =
      await Promise.all([
        Order.countDocuments(validOrders),
        User.countDocuments({ isAdmin: false }),
        Product.countDocuments({}),
        Review.countDocuments({ status: "pending" }),
        Order.aggregate([{ $match: validOrders }, { $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
        Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        Product.find({ stock: { $lte: 5 } }).sort("stock").limit(8).select("title stock images price"),
        Order.find({}).populate("user", "name email").sort("-createdAt").limit(8),
        Product.find({}).sort("-sold").limit(5).select("title sold price images stock"),
      ]);

    // last 14 days revenue
    const since = new Date(Date.now() - 13 * 86400000);
    since.setHours(0, 0, 0, 0);
    const daily = await Order.aggregate([
      { $match: { createdAt: { $gte: since }, ...validOrders } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 },
      } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totals: {
        revenue: revenueAgg[0]?.total || 0,
        orders: totalOrders,
        customers: totalCustomers,
        products: totalProducts,
        pendingReviews,
      },
      ordersByStatus: Object.fromEntries(statusAgg.map((s) => [s._id, s.count])),
      dailySales: daily,
      lowStock, recentOrders, topProducts,
    });
  } catch (err) { next(err); }
});

// GET /api/admin/sales-report?from=&to= — grouped by day
router.get("/sales-report", async (req, res, next) => {
  try {
    const to = req.query.to ? new Date(req.query.to + "T23:59:59") : new Date();
    const from = req.query.from ? new Date(req.query.from) : new Date(to.getTime() - 29 * 86400000);
    const match = { createdAt: { $gte: from, $lte: to }, status: { $ne: "cancelled" } };

    const [rows, totals, byCategory] = await Promise.all([
      Order.aggregate([
        { $match: match },
        { $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 },
            items: { $sum: { $sum: "$items.qty" } }, discount: { $sum: "$discount" },
        } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: match },
        { $group: { _id: null, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 }, discount: { $sum: "$discount" },
            avgOrder: { $avg: "$totalPrice" } } },
      ]),
      Order.aggregate([
        { $match: match },
        { $unwind: "$items" },
        { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "prod" } },
        { $unwind: "$prod" },
        { $lookup: { from: "categories", localField: "prod.category", foreignField: "_id", as: "cat" } },
        { $unwind: "$cat" },
        { $group: { _id: "$cat.name", revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } }, units: { $sum: "$items.qty" } } },
        { $sort: { revenue: -1 } },
      ]),
    ]);

    res.json({ from, to, rows, totals: totals[0] || { revenue: 0, orders: 0, discount: 0, avgOrder: 0 }, byCategory });
  } catch (err) { next(err); }
});

// GET /api/admin/customers
router.get("/customers", async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const filter = { isAdmin: false };
    if (q) filter.$or = [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }];
    const total = await User.countDocuments(filter);
    const users = await User.find(filter).sort("-createdAt").skip((page - 1) * limit).limit(+limit).lean();

    const stats = await Order.aggregate([
      { $match: { user: { $in: users.map((u) => u._id) }, status: { $ne: "cancelled" } } },
      { $group: { _id: "$user", orders: { $sum: 1 }, spent: { $sum: "$totalPrice" } } },
    ]);
    const statMap = Object.fromEntries(stats.map((s) => [s._id.toString(), s]));
    res.json({
      customers: users.map((u) => ({
        ...u,
        orderCount: statMap[u._id.toString()]?.orders || 0,
        totalSpent: statMap[u._id.toString()]?.spent || 0,
      })),
      total, pages: Math.ceil(total / limit),
    });
  } catch (err) { next(err); }
});

// PUT /api/admin/inventory/:productId { stock }
router.put("/inventory/:productId", async (req, res, next) => {
  try {
    const { stock } = req.body;
    if (stock == null || stock < 0) return res.status(400).json({ message: "Stock must be 0 or more" });
    const product = await Product.findByIdAndUpdate(req.params.productId, { stock }, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) { next(err); }
});

export default router;
