import { useEffect, useState } from "react";
import api, { money } from "../../api.js";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      api.get("/admin/customers", { params: { q, limit: 100 } }).then((res) => setCustomers(res.data.customers));
    }, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <>
      <div className="admin-head-row">
        <h1 className="admin-title">Customers ({customers.length})</h1>
        <input className="search-input" placeholder="Search name or email…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="card-box">
        <table className="admin-table">
          <thead><tr><th>Customer</th><th>Email</th><th>Joined</th><th>Orders</th><th>Total spent</th></tr></thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c._id}>
                <td><b>{c.name}</b></td>
                <td>{c.email}</td>
                <td>{new Date(c.createdAt).toLocaleDateString("en-GB")}</td>
                <td>{c.orderCount}</td>
                <td><b>{money(c.totalSpent)}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <p className="muted" style={{ padding: 16 }}>No customers found.</p>}
      </div>
    </>
  );
}
