import { Router } from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { getPaymentProvider, PAYMENT_METHODS } from "../payments/gateway.js";

const router = Router();
const FREE_SHIP_THRESHOLD = 25;
const SHIPPING_PRICE = 3.49;

// GET /api/orders/payment-methods
router.get("/payment-methods", (req, res) => res.json({ methods: PAYMENT_METHODS }));

// POST /api/orders — checkout: validates stock & prices server-side, charges, stores order
router.post("/", protect, async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod = "cod", couponCode } = req.body;
    if (!items?.length) return res.status(400).json({ message: "Your cart is empty" });
    const required = ["fullName", "line1", "city", "postcode"];
    if (!shippingAddress || required.some((f) => !shippingAddress[f])) {
      return res.status(400).json({ message: "Shipping address is incomplete" });
    }
    const method = PAYMENT_METHODS.find((m) => m.id === paymentMethod && m.enabled);
    if (!method) return res.status(400).json({ message: "Payment method not available" });

    // build order items from DB (never trust client prices)
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) return res.status(400).json({ message: `Product unavailable: ${item.title || item.product}` });
      if (product.stock < item.qty) return res.status(400).json({ message: `Only ${product.stock} left of "${product.title}"` });
      orderItems.push({ product: product._id, title: product.title, image: product.images[0] || "", price: product.price, qty: item.qty });
    }
    const itemsPrice = Math.round(orderItems.reduce((s, i) => s + i.price * i.qty, 0) * 100) / 100;
    const shippingPrice = itemsPrice >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_PRICE;

    // coupon
    let discount = 0, appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (!coupon) return res.status(400).json({ message: "Invalid coupon code" });
      const error = coupon.validateFor(itemsPrice);
      if (error) return res.status(400).json({ message: error });
      discount = coupon.discountFor(itemsPrice);
      appliedCoupon = coupon;
    }
    const totalPrice = Math.round((itemsPrice + shippingPrice - discount) * 100) / 100;

    // charge via modular gateway
    const payment = await getPaymentProvider().charge({
      amount: totalPrice, currency: "GBP", method: paymentMethod, meta: { userId: req.user._id.toString() },
    });
    if (!payment.success) return res.status(402).json({ message: "Payment failed" });

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult: {
        provider: getPaymentProvider().name,
        transactionId: payment.transactionId,
        status: payment.status,
        paidAt: payment.status === "paid" ? new Date() : null,
      },
      itemsPrice, shippingPrice, discount,
      couponCode: appliedCoupon?.code || null,
      totalPrice,
      isPaid: payment.status === "paid",
      status: "processing",
      statusHistory: [{ status: "processing", note: "Order placed" }],
    });

    // decrement stock, bump sold + coupon usage
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty, sold: item.qty } });
    }
    if (appliedCoupon) await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usedCount: 1 } });

    res.status(201).json({ order });
  } catch (err) { next(err); }
});

// GET /api/orders/mine
router.get("/mine", protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
    res.json({ orders });
  } catch (err) { next(err); }
});

// GET /api/orders/:id — owner or admin
router.get("/:id", protect, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Order not found" });
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!req.user.isAdmin && !order.user._id.equals(req.user._id)) {
      return res.status(403).json({ message: "Not your order" });
    }
    res.json({ order });
  } catch (err) { next(err); }
});

// PUT /api/orders/:id/cancel — owner can cancel while processing
router.put("/:id/cancel", protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!order.user.equals(req.user._id)) return res.status(403).json({ message: "Not your order" });
    if (!["pending", "processing"].includes(order.status)) {
      return res.status(400).json({ message: "This order can no longer be cancelled" });
    }
    order.status = "cancelled";
    order.statusHistory.push({ status: "cancelled", note: "Cancelled by customer" });
    await order.save();
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty, sold: -item.qty } });
    }
    res.json({ order });
  } catch (err) { next(err); }
});

// ---- admin ----
// GET /api/orders?status=&page=
router.get("/", protect, adminOnly, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status && status !== "all" ? { status } : {};
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(+limit);
    res.json({ orders, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// PUT /api/orders/:id/status — admin updates status / tracking
router.put("/:id/status", protect, adminOnly, async (req, res, next) => {
  try {
    const { status, note, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (status && status !== order.status) {
      order.status = status;
      order.statusHistory.push({ status, note: note || "" });
      if (status === "delivered") {
        order.deliveredAt = new Date();
        if (order.paymentMethod === "cod") {
          order.isPaid = true;
          order.paymentResult.status = "paid";
          order.paymentResult.paidAt = new Date();
        }
      }
    }
    await order.save();
    res.json({ order });
  } catch (err) { next(err); }
});

export default router;
