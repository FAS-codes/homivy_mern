import { Link, useNavigate } from "react-router-dom";
import { money } from "../api.js";
import { useCart, FREE_SHIP_THRESHOLD } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Cart() {
  const { items, setQty, subtotal, shipping } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100);

  if (items.length === 0) {
    return (
      <section className="page-hero" style={{ minHeight: "70vh" }}>
        <div className="hero-bg" />
        <div className="wrap" style={{ textAlign: "center" }}>
          <h1>Your cart is empty</h1>
          <p style={{ margin: "16px auto 28px" }}>Beautiful home essentials are waiting for you.</p>
          <Link to="/shop" className="btn btn-primary">Start shopping <span className="arr">→</span></Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-hero" style={{ paddingBottom: 80 }}>
      <div className="hero-bg" />
      <div className="wrap">
        <h1>Your Cart</h1>
        <div className="cart-layout">
          <div className="cart-list">
            <div className="ship-progress card-box">
              <div className="msg">
                {remaining > 0 ? <>Add <b>{money(remaining)}</b> more for <b>free shipping</b></> : <>🎉 You've unlocked <b>free shipping</b>!</>}
              </div>
              <div className="ship-bar"><i style={{ width: pct + "%" }} /></div>
            </div>
            {items.map((i) => (
              <div className="cart-item card-box" key={i._id}>
                <Link to={`/product/${i.slug}`}><img src={i.image} alt={i.title} /></Link>
                <div className="ci-info">
                  <Link to={`/product/${i.slug}`} className="ci-title">{i.title}</Link>
                  <div className="ci-price">{money(i.price)} each</div>
                  <div className="ci-controls">
                    <div className="ci-qty">
                      <button onClick={() => setQty(i._id, i.qty - 1)}>−</button>
                      <span>{i.qty}</span>
                      <button onClick={() => setQty(i._id, i.qty + 1)}>+</button>
                    </div>
                    <button className="ci-remove" onClick={() => setQty(i._id, 0)}>Remove</button>
                  </div>
                </div>
                <div className="ci-line-total">{money(i.price * i.qty)}</div>
              </div>
            ))}
          </div>
          <aside className="summary card-box">
            <h3>Order Summary</h3>
            <div className="sum-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="sum-row"><span>Shipping</span><span>{shipping === 0 ? "Free" : money(shipping)}</span></div>
            <div className="sum-row total"><span>Total</span><span>{money(subtotal + shipping)}</span></div>
            <small className="muted">Coupons can be applied at checkout.</small>
            <button className="btn btn-lime checkout-btn" onClick={() => navigate(user ? "/checkout" : "/login", { state: { from: "/checkout" } })}>
              {user ? "Proceed to checkout" : "Login to checkout"} <span className="arr">→</span>
            </button>
            <Link to="/shop" className="continue-link">← Continue shopping</Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
