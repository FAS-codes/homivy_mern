import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { money } from "../../api.js";
import { StatusBadge } from "../../components/OrderStatus.jsx";

export default function Orders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api.get("/orders/mine").then((res) => setOrders(res.data.orders));
  }, []);

  if (!orders) return <div className="card-box">Loading…</div>;
  if (orders.length === 0) {
    return (
      <div className="card-box empty-state">
        <div className="big">No orders yet</div>
        <p>When you place an order, it will show up here.</p>
        <Link to="/shop" className="btn btn-primary btn-sm" style={{ marginTop: 14 }}>Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="card-box">
      <h3>Order History</h3>
      <div className="order-list">
        {orders.map((o) => (
          <Link to={`/account/orders/${o._id}`} className="order-row" key={o._id}>
            <div className="order-thumbs">
              {o.items.slice(0, 3).map((i, idx) => <img key={idx} src={i.image} alt="" />)}
              {o.items.length > 3 && <span className="more">+{o.items.length - 3}</span>}
            </div>
            <div className="order-meta">
              <b>#{o._id.slice(-8).toUpperCase()}</b>
              <small>{new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · {o.items.reduce((s, i) => s + i.qty, 0)} item(s)</small>
            </div>
            <StatusBadge status={o.status} />
            <b className="order-total">{money(o.totalPrice)}</b>
          </Link>
        ))}
      </div>
    </div>
  );
}
