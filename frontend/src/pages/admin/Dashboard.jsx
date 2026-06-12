import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { money } from "../../api.js";
import { StatusBadge } from "../../components/OrderStatus.jsx";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/analytics").then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="page-loading">Loading analytics…</div>;
  const { totals, dailySales, lowStock, recentOrders, topProducts, ordersByStatus } = data;
  const maxRev = Math.max(...dailySales.map((d) => d.revenue), 1);

  return (
    <>
      <h1 className="admin-title">Dashboard</h1>
      <div className="stat-cards">
        <div className="stat-card"><span>Total revenue</span><b>{money(totals.revenue)}</b></div>
        <div className="stat-card"><span>Orders</span><b>{totals.orders}</b></div>
        <div className="stat-card"><span>Customers</span><b>{totals.customers}</b></div>
        <div className="stat-card"><span>Products</span><b>{totals.products}</b></div>
        <div className="stat-card alert"><span>Pending reviews</span><b>{totals.pendingReviews}</b></div>
      </div>

      <div className="admin-grid-2">
        <div className="card-box">
          <h3>Revenue — last 14 days</h3>
          {dailySales.length === 0 ? <p className="muted">No sales in this period yet.</p> : (
            <div className="bar-chart">
              {dailySales.map((d) => (
                <div className="bar-col" key={d._id} title={`${d._id}: ${money(d.revenue)} (${d.orders} orders)`}>
                  <div className="bar" style={{ height: `${(d.revenue / maxRev) * 100}%` }} />
                  <small>{d._id.slice(5)}</small>
                </div>
              ))}
            </div>
          )}
          <div className="status-pills">
            {Object.entries(ordersByStatus).map(([s, n]) => (
              <span key={s}><StatusBadge status={s} /> {n}</span>
            ))}
          </div>
        </div>

        <div className="card-box">
          <h3>Top products</h3>
          <table className="admin-table slim">
            <tbody>
              {topProducts.map((p) => (
                <tr key={p._id}>
                  <td><img className="t-img" src={p.images[0]} alt="" /></td>
                  <td>{p.title}</td>
                  <td>{p.sold} sold</td>
                  <td>{money(p.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 style={{ marginTop: 22 }}>Low stock (≤ 5)</h3>
          {lowStock.length === 0 ? <p className="muted">All products are well stocked.</p> : (
            <table className="admin-table slim">
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p._id}>
                    <td><img className="t-img" src={p.images[0]} alt="" /></td>
                    <td>{p.title}</td>
                    <td className={p.stock === 0 ? "danger-text" : "warn-text"}>{p.stock} left</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card-box">
        <h3>Recent orders</h3>
        <table className="admin-table">
          <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th>Total</th></tr></thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o._id}>
                <td><Link to="/admin/orders" className="link">#{o._id.slice(-8).toUpperCase()}</Link></td>
                <td>{o.user?.name}<br /><small className="muted">{o.user?.email}</small></td>
                <td>{new Date(o.createdAt).toLocaleDateString("en-GB")}</td>
                <td><StatusBadge status={o.status} /></td>
                <td><b>{money(o.totalPrice)}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
