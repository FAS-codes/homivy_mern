import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import api, { money } from "../../api.js";
import { StatusBadge, OrderTimeline } from "../../components/OrderStatus.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then((res) => setOrder(res.data.order))
      .catch((err) => setError(err.userMessage));
  }, [id]);

  const cancel = async () => {
    if (!confirm("Cancel this order?")) return;
    try {
      const res = await api.put(`/orders/${id}/cancel`);
      setOrder(res.data.order);
      toast("Order cancelled");
    } catch (err) { toast(err.userMessage, "error"); }
  };

  if (error) return <div className="card-box">{error} — <Link to="/account/orders">back to orders</Link></div>;
  if (!order) return <div className="card-box">Loading…</div>;

  const canCancel = ["pending", "processing"].includes(order.status);

  return (
    <>
      {location.state?.justPlaced && (
        <div className="card-box success-banner">
          <b>🎉 Order placed successfully!</b> A confirmation is on its way. You can track progress below.
        </div>
      )}
      <div className="card-box">
        <div className="order-head">
          <div>
            <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
            <small className="muted">Placed {new Date(order.createdAt).toLocaleString("en-GB")}</small>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <OrderTimeline order={order} />
        {order.trackingNumber && (
          <p className="tracking-line">Tracking number: <b>{order.trackingNumber}</b></p>
        )}
        {canCancel && <button className="btn btn-ghost btn-sm danger" onClick={cancel}>Cancel order</button>}
      </div>

      <div className="card-box">
        <h3>Items</h3>
        {order.items.map((i, idx) => (
          <div className="sum-item" key={idx}>
            <img src={i.image} alt="" /><span>{i.title} × {i.qty}</span><b>{money(i.price * i.qty)}</b>
          </div>
        ))}
        <div className="sum-row"><span>Items</span><span>{money(order.itemsPrice)}</span></div>
        <div className="sum-row"><span>Shipping</span><span>{order.shippingPrice === 0 ? "Free" : money(order.shippingPrice)}</span></div>
        {order.discount > 0 && <div className="sum-row discount"><span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span><span>−{money(order.discount)}</span></div>}
        <div className="sum-row total"><span>Total</span><span>{money(order.totalPrice)}</span></div>
      </div>

      <div className="card-box two-col">
        <div>
          <h3>Shipping Address</h3>
          <p className="addr-block">
            {order.shippingAddress.fullName}<br />
            {order.shippingAddress.line1}{order.shippingAddress.line2 ? <><br />{order.shippingAddress.line2}</> : null}<br />
            {order.shippingAddress.city}, {order.shippingAddress.postcode}<br />
            {order.shippingAddress.country}
          </p>
        </div>
        <div>
          <h3>Payment</h3>
          <p className="addr-block">
            Method: <b>{order.paymentMethod === "cod" ? "Cash on Delivery" : "Card (demo)"}</b><br />
            Status: <b>{order.isPaid ? "Paid" : "Pending"}</b>
            {order.paymentResult?.transactionId && <><br />Ref: {order.paymentResult.transactionId}</>}
          </p>
        </div>
      </div>
    </>
  );
}
