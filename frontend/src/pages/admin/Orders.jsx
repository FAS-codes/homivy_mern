import { useEffect, useState } from "react";
import api, { money } from "../../api.js";
import { StatusBadge, OrderTimeline } from "../../components/OrderStatus.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const STATUSES = ["pending", "processing", "shipped", "out-for-delivery", "delivered", "cancelled"];

export default function Orders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(null);
  const [update, setUpdate] = useState({ status: "", note: "", trackingNumber: "" });

  const load = () => api.get(`/orders?status=${filter}&limit=100`).then((res) => setOrders(res.data.orders));
  useEffect(() => { load(); }, [filter]);

  const openOrder = (o) => {
    setOpen(open?._id === o._id ? null : o);
    setUpdate({ status: o.status, note: "", trackingNumber: o.trackingNumber || "" });
  };

  const saveUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/orders/${open._id}/status`, update);
      toast("Order updated");
      setOpen(res.data.order);
      load();
    } catch (err) { toast(err.userMessage, "error"); }
  };

  return (
    <>
      <div className="admin-head-row">
        <h1 className="admin-title">Orders</h1>
        <div className="filter-chips">
          {["all", ...STATUSES].map((s) => (
            <button key={s} className={`chip ${filter === s ? "active" : ""}`} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="card-box">
        <table className="admin-table">
          <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Items</th><th>Status</th><th>Paid</th><th>Total</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className={`clickable ${open?._id === o._id ? "open" : ""}`} onClick={() => openOrder(o)}>
                <td><b>#{o._id.slice(-8).toUpperCase()}</b></td>
                <td>{o.user?.name}<br /><small className="muted">{o.user?.email}</small></td>
                <td>{new Date(o.createdAt).toLocaleDateString("en-GB")}</td>
                <td>{o.items.reduce((s, i) => s + i.qty, 0)}</td>
                <td><StatusBadge status={o.status} /></td>
                <td>{o.isPaid ? "✓" : "—"}</td>
                <td><b>{money(o.totalPrice)}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="muted" style={{ padding: 16 }}>No orders with this status.</p>}
      </div>

      {open && (
        <div className="card-box">
          <div className="order-head">
            <h3>Order #{open._id.slice(-8).toUpperCase()} — {open.user?.name}</h3>
            <StatusBadge status={open.status} />
          </div>
          <div className="two-col">
            <div>
              {open.items.map((i, idx) => (
                <div className="sum-item" key={idx}><img src={i.image} alt="" /><span>{i.title} × {i.qty}</span><b>{money(i.price * i.qty)}</b></div>
              ))}
              <div className="sum-row total"><span>Total {open.discount > 0 ? `(−${money(open.discount)} ${open.couponCode || ""})` : ""}</span><span>{money(open.totalPrice)}</span></div>
              <p className="addr-block" style={{ marginTop: 12 }}>
                <b>Ship to:</b> {open.shippingAddress.fullName}, {open.shippingAddress.line1}, {open.shippingAddress.city} {open.shippingAddress.postcode}
              </p>
            </div>
            <div>
              <OrderTimeline order={open} />
              <form className="form-grid" onSubmit={saveUpdate} style={{ marginTop: 14 }}>
                <select value={update.status} onChange={(e) => setUpdate({ ...update, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input placeholder="Tracking number" value={update.trackingNumber} onChange={(e) => setUpdate({ ...update, trackingNumber: e.target.value })} />
                <input placeholder="Status note (optional)" className="full" value={update.note} onChange={(e) => setUpdate({ ...update, note: e.target.value })} />
                <div className="full"><button className="btn btn-primary btn-sm">Update order</button></div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
