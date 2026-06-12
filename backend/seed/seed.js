/**
 * Seeds categories, products, demo users and coupons.
 * Run: npm run seed   (WARNING: clears existing data in these collections)
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import Wishlist from "../models/Wishlist.js";
import Coupon from "../models/Coupon.js";

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

const CATEGORY_MAP = {
  washroom: { name: "Washroom & Hygiene", tagline: "A fresher, cleaner bathroom every day" },
  kitchen: { name: "Kitchen Essentials", tagline: "Smart tools for effortless cooking" },
  decor: { name: "Home Decor", tagline: "Details that make a house a home" },
  household: { name: "Household Essentials", tagline: "Everyday solutions that just work" },
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Seeding…");

  await Promise.all([
    User.deleteMany({}), Product.deleteMany({}), Category.deleteMany({}),
    Order.deleteMany({}), Review.deleteMany({}), Wishlist.deleteMany({}), Coupon.deleteMany({}),
  ]);

  // categories
  const catDocs = {};
  for (const [slug, c] of Object.entries(CATEGORY_MAP)) {
    catDocs[slug] = await Category.create({ name: c.name, slug, tagline: c.tagline });
  }

  // products
  const raw = JSON.parse(fs.readFileSync(new URL("./products.json", import.meta.url)));
  for (const p of raw) {
    const cat = catDocs[p.category];
    await Product.create({
      title: p.title,
      slug: p.handle.slice(0, 80).replace(/-+$/, ""),
      fullTitle: p.fullTitle,
      description: p.short,
      features: p.features,
      images: p.images,
      category: cat._id,
      price: p.price,
      comparePrice: p.compare,
      stock: 20 + Math.floor(Math.random() * 60),
      sold: Math.floor(Math.random() * 40),
      tags: p.tags,
    });
    catDocs[p.category].image = catDocs[p.category].image || p.images[0];
  }
  // category hero images (representative products)
  const pick = async (re) => (await Product.findOne({ slug: { $regex: re } }))?.images[0];
  catDocs.decor.image = (await pick("ceramic-vase")) || catDocs.decor.image;
  catDocs.washroom.image = (await pick("shower-caddy")) || catDocs.washroom.image;
  catDocs.kitchen.image = (await pick("red-wine-glass")) || catDocs.kitchen.image;
  catDocs.household.image = (await pick("sherpa")) || catDocs.household.image;
  for (const c of Object.values(catDocs)) await c.save();

  // users
  const admin = await User.create({ name: "Homivy Admin", email: "admin@homivy.com", password: "admin123", isAdmin: true });
  const demo = await User.create({
    name: "Demo Customer", email: "demo@homivy.com", password: "demo123",
    addresses: [{ label: "Home", fullName: "Demo Customer", phone: "07700 900123", line1: "12 Maple Street", city: "London", postcode: "E1 6AN", country: "United Kingdom", isDefault: true }],
  });

  // coupons
  await Coupon.create([
    { code: "WELCOME10", type: "percent", value: 10, minSpend: 0 },
    { code: "HOME5", type: "fixed", value: 5, minSpend: 30 },
    { code: "EXPIRED", type: "percent", value: 50, isActive: false },
  ]);

  // a demo order + approved review so dashboards aren't empty
  const someProducts = await Product.find({}).limit(2);
  const items = someProducts.map((p) => ({ product: p._id, title: p.title, image: p.images[0], price: p.price, qty: 1 }));
  const itemsPrice = items.reduce((s, i) => s + i.price * i.qty, 0);
  await Order.create({
    user: demo._id, items,
    shippingAddress: { fullName: "Demo Customer", line1: "12 Maple Street", city: "London", postcode: "E1 6AN", country: "United Kingdom" },
    paymentMethod: "card",
    paymentResult: { provider: "placeholder", transactionId: "DEMO-SEED-001", status: "paid", paidAt: new Date() },
    itemsPrice, shippingPrice: itemsPrice >= 25 ? 0 : 3.49, totalPrice: itemsPrice + (itemsPrice >= 25 ? 0 : 3.49),
    isPaid: true, status: "delivered", deliveredAt: new Date(),
    statusHistory: [
      { status: "processing", note: "Order placed", at: new Date(Date.now() - 4 * 86400000) },
      { status: "shipped", note: "Dispatched via Royal Mail", at: new Date(Date.now() - 3 * 86400000) },
      { status: "delivered", note: "Left with resident", at: new Date(Date.now() - 86400000) },
    ],
    trackingNumber: "RM123456789GB",
  });
  const review = await Review.create({ user: demo._id, product: someProducts[0]._id, rating: 5, comment: "Excellent quality, exactly as described. Fast delivery too!", status: "approved" });
  await Review.syncProductRating(review.product);

  console.log("Seeded:");
  console.log("  4 categories, 20 products, 3 coupons, 1 order, 1 review");
  console.log("  Admin → admin@homivy.com / admin123");
  console.log("  Demo  → demo@homivy.com / demo123");
  await mongoose.disconnect();
}

run().catch((err) => { console.error(err); process.exit(1); });
