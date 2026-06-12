import { Router } from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

const publicUser = (u) => ({
  _id: u._id, name: u.name, email: u.email, isAdmin: u.isAdmin, addresses: u.addresses, createdAt: u.createdAt,
});

// PUT /api/users/profile — update name/email
router.put("/profile", async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (email && email !== req.user.email) {
      const taken = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (taken) return res.status(409).json({ message: "That email is already in use" });
      req.user.email = email;
    }
    if (name) req.user.name = name;
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  } catch (err) { next(err); }
});

// PUT /api/users/password — change password
router.put("/password", async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }
    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.matchPassword(currentPassword || ""))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) { next(err); }
});

// Address book
// POST /api/users/addresses
router.post("/addresses", async (req, res, next) => {
  try {
    const addr = req.body;
    if (addr.isDefault) req.user.addresses.forEach((a) => (a.isDefault = false));
    if (req.user.addresses.length === 0) addr.isDefault = true;
    req.user.addresses.push(addr);
    await req.user.save();
    res.status(201).json({ addresses: req.user.addresses });
  } catch (err) { next(err); }
});

// PUT /api/users/addresses/:addrId
router.put("/addresses/:addrId", async (req, res, next) => {
  try {
    const addr = req.user.addresses.id(req.params.addrId);
    if (!addr) return res.status(404).json({ message: "Address not found" });
    if (req.body.isDefault) req.user.addresses.forEach((a) => (a.isDefault = false));
    Object.assign(addr, req.body);
    await req.user.save();
    res.json({ addresses: req.user.addresses });
  } catch (err) { next(err); }
});

// DELETE /api/users/addresses/:addrId
router.delete("/addresses/:addrId", async (req, res, next) => {
  try {
    const addr = req.user.addresses.id(req.params.addrId);
    if (!addr) return res.status(404).json({ message: "Address not found" });
    addr.deleteOne();
    if (addr.isDefault && req.user.addresses.length) req.user.addresses[0].isDefault = true;
    await req.user.save();
    res.json({ addresses: req.user.addresses });
  } catch (err) { next(err); }
});

export default router;
