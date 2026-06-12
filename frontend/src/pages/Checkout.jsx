import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { money } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const EMPTY_ADDR = { fullName: "", phone: "", line1: "", line2: "", city: "", postcode: "", country: "United Kingdom" };

export default function Checkout() {
  const { items, subtotal, shipping, clear } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [methods, setMethods] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [savedId, setSavedId] = useState("");
  const [address, setAddress] = useState(EMPTY_ADDR);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    api.get("/orders/payment-methods").then((res) => {
      setMethods(res.data.methods);
      const first = res.data.methods.find((m) => m.enabled);
      if (first) setPaymentMethod(first.id);
    });
    const def = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
    if (def) { setSavedId(def._id); setAddress({ ...def }); }
  }, [user]);

  useEffect(() => {
    if (items.length === 0 && !placing) navigate("/cart");
  }, [items.length]);

  const pickSaved = (id) => {
    setSavedId(id);
    if (id === "new") setAddress(EMPTY_ADDR);
    else {
      const a = user.addresses.find((x) => x._id === id);
      if (a) setAddress({ ...a });
    }
  };

  const applyCoupon = async () => {
    try {
      const res = await api.post("/coupons/validate", { code: couponInput, subtotal });
      setCoupon(res.data);
      toast(`Coupon ${res.data.code} applied — you save ${money(res.data.discount)}`);
    } catch (err) {
      setCoupon(null);
      toast(err.userMessage, "error");
    }
  };

  const discount = coupon?.discount || 0;
  const total = Math.max(0, Math.round((subtotal + shipping - discount) * 100) / 100);

  const placeOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const res = await api.post("/orders", {
        items: items.map((i) => ({ product: i._id, qty: i.qty, title: i.title })),
        shippingAddress: address,
        paymentMethod,
        couponCode: coupon?.code || null,
      });
      clear();
      toast("Order placed — thank you!");
      navigate(`/account/orders/${res.data.order._id}`, { state: { justPlaced: true } });
    } catch (err) {
      toast(err.userMessage, "error");
      setPlacing(false);
    }
  };

  return (
    <section className="page-hero" style={{ paddingBottom: 80 }}>
      <div className="hero-bg" />
      <div className="wrap">
        <h1>Checkout</h1>
        <form className="cart-layout" onSubmit={placeOrder}>
          <div className="cart-list">
            <div className="card-box">
              <h3>Shipping Address</h3>
              {user.addresses?.length > 0 && (
                <div className="saved-addr-row">
                  {user.addresses.map((a) => (
                    <label key={a._id} className={`addr-pick ${savedId === a._id ? "active" : ""}`}>
                      <input type="radio" name="savedAddr" checked={savedId === a._id} onChange={() => pickSaved(a._id)} />
                      <b>{a.label}</b><span>{a.line1}, {a.city} {a.postcode}</span>
                    </label>
                  ))}
                  <label className={`addr-pick ${savedId === "new" ? "active" : ""}`}>
                    <input type="radio" name="savedAddr" checked={savedId === "new"} onChange={() => pickSaved("new")} />
                    <b>+ New address</b><span>Enter a different address</span>
                  </label>
                </div>
              )}
              <div className="form-grid">
                <input required placeholder="Full name *" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
                <input placeholder="Phone" value={address.phone || ""} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                <input required placeholder="Address line 1 *" className="full" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
                <input placeholder="Address line 2" className="full" value={address.line2 || ""} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
                <input required placeholder="City *" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                <input required placeholder="Postcode *" value={address.postcode} onChange={(e) => setAddress({ ...address, postcode: e.target.value })} />
                <input placeholder="Country" className="full" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
              </div>
            </div>

            <div className="card-box">
              <h3>Payment Method</h3>
              <div className="pay-methods">
                {methods.map((m) => (
                  <label key={m.id} className={`pay-pick ${paymentMethod === m.id ? "active" : ""} ${!m.enabled ? "disabled" : ""}`}>
                    <input type="radio" name="pay" disabled={!m.enabled} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} />
                    <b>{m.label}</b><span>{m.description}</span>
                  </label>
                ))}
              </div>
              <small className="muted">Payments run through a modular gateway — Stripe / PayPal can be switched on later without changing the checkout.</small>
            </div>
          </div>

          <aside className="summary card-box">
            <h3>Order Summary</h3>
            {items.map((i) => (
              <div className="sum-item" key={i._id}>
                <img src={i.image} alt="" /><span>{i.title} × {i.qty}</span><b>{money(i.price * i.qty)}</b>
              </div>
            ))}
            <div className="coupon-row">
              <input placeholder="Coupon code" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} />
              <button type="button" className="btn btn-ghost btn-sm" onClick={applyCoupon} disabled={!couponInput}>Apply</button>
            </div>
            {coupon && <div className="sum-row discount"><span>Coupon {coupon.code}</span><span>−{money(discount)}</span></div>}
            <div className="sum-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="sum-row"><span>Shipping</span><span>{shipping === 0 ? "Free" : money(shipping)}</span></div>
            <div className="sum-row total"><span>Total</span><span>{money(total)}</span></div>
            <button className="btn btn-lime checkout-btn" type="submit" disabled={placing}>
              {placing ? "Placing order…" : <>Place order — {money(total)} <span className="arr">→</span></>}
            </button>
            <Link to="/cart" className="continue-link">← Back to cart</Link>
          </aside>
        </form>
      </div>
    </section>
  );
}
