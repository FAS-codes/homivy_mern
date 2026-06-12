import { useEffect, useState } from "react";
import api, { money } from "../../api.js";

const fmt = (d) => d.toISOString().slice(0, 10);

export default function Reports() {
  const [from, setFrom] = useState(fmt(new Date(Date.now() - 29 * 86400000)));
  const [to, setTo] = useState(fmt(new Date()));
  const [report, setReport] = useState(null);

  const load = () => api.get("/admin/sales-report", { params: { from, to } }).then((res) => setReport(res.data));
  useEffect(() => { load(); }, []);

  if (!report) return <div className="page-loading">Loading report…</div>;
  const maxRev = Math.max(...report.rows.map((r) => r.revenue), 1);
  const maxCatRev = Math.max(...report.byCategory.map((c) => c.revenue), 1);

  return (
    <>
      <div className="admin-head-row">
        <h1 className="admin-title">Sales Reports</h1>
        <div className="row-actions">
          <input type="date" className="sort-select" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" className="sort-select" value={to} onChange={(e) => setTo(e.target.value)} />
          <button className="btn btn-primary btn-sm" onClick={load}>Run report</button>
        </div>
      </div>

      <div className="stat-cards">
        <div className="stat-card"><span>Revenue</span><b>{money(report.totals.revenue)}</b></div>
        <div className="stat-card"><span>Orders</span><b>{report.totals.orders}</b></div>
        <div className="stat-card"><span>Avg order value</span><b>{money(report.totals.avgOrder)}</b></div>
        <div className="stat-card"><span>Discounts given</span><b>{money(report.totals.discount)}</b></div>
      </div>

      <div className="admin-grid-2">
        <div className="card-box">
          <h3>Daily revenue</h3>
          {report.rows.length === 0 ? <p className="muted">No sales in this range.</p> : (
            <div className="bar-chart">
              {report.rows.map((r) => (
                <div className="bar-col" key={r._id} title={`${r._id}: ${money(r.revenue)} (${r.orders} orders, ${r.items} items)`}>
                  <div className="bar" style={{ height: `${(r.revenue / maxRev) * 100}%` }} />
                  <small>{r._id.slice(5)}</small>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card-box">
          <h3>Revenue by category</h3>
          {report.byCategory.length === 0 ? <p className="muted">No data.</p> : (
            <div className="h-bars">
              {report.byCategory.map((c) => (
                <div className="h-bar-row" key={c._id}>
                  <span>{c._id}</span>
                  <div className="h-bar"><i style={{ width: `${(c.revenue / maxCatRev) * 100}%` }} /></div>
                  <b>{money(c.revenue)}</b><small className="muted">{c.units} units</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card-box">
        <h3>Daily breakdown</h3>
        <table className="admin-table">
          <thead><tr><th>Date</th><th>Orders</th><th>Items</th><th>Discounts</th><th>Revenue</th></tr></thead>
          <tbody>
            {report.rows.map((r) => (
              <tr key={r._id}>
                <td>{r._id}</td><td>{r.orders}</td><td>{r.items}</td><td>{money(r.discount)}</td><td><b>{money(r.revenue)}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
