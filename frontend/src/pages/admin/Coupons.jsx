import { useEffect, useState } from "react";
import api, { money } from "../../api.js";
import { useToast } from "../../context/ToastContext.jsx";

const EMPTY = { code: "", type: "percent", value: 10, minSpend: 0, expiresAt: "", usageLimit: "", isActive: true };

export default function Coupons() {
  const toast = useToast();
  const [coupons, setCoupons] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const load = () => api.get("/coupons").then((res) => setCoupons(res.data.coupons));
  useEffect(() => { load(); }, []);

  const startEdit = (c) => {
    if (c) {
      setEditing(c._id);
      setForm({ code: c.code, type: c.type, value: c.value, minSpend: c.minSpend,
        expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "", usageLimit: c.usageLimit ?? "", isActive: c.isActive });
    } else { setEditing("new"); setForm(EMPTY); }
  };

  const save = async (e) => {
    e.preventDefault();
    const body = { ...form, value: +form.value, minSpend: +form.minSpend || 0,
      expiresAt: form.expiresAt || null, usageLimit: form.usageLimit === "" ? null : +form.usageLimit };
    try {
      if (editing === "new") await api.post("/coupons", body);
      else await api.put(`/coupons/${editing}`, body);
      toast("Coupon saved");
      setEditing(null);
      load();
    } catch (err) { toast(err.userMessage, "error"); }
  };

  const remove = async (c) => {
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    await api.delete(`/coupons/${c._id}`);
    toast("Coupon deleted");
    load();
  };

  return (
    <>
      <div className="admin-head-row">
        <h1 className="admin-title">Coupons</h1>
        <button className="btn btn-primary btn-sm" onClick={() => startEdit(null)}>+ New coupon</button>
      </div>

      {editing && (
        <form className="card-box form-grid" onSubmit={save}>
          <input required placeholder="Code * (e.g. SAVE10)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="percent">Percent off (%)</option>
            <option value="fixed">Fixed amount (£)</option>
          </select>
          <input required type="number" step="0.01" min="0" placeholder="Value *" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
          <input type="number" step="0.01" min="0" placeholder="Min spend (£)" value={form.minSpend} onChange={(e) => setForm({ ...form, minSpend: e.target.value })} />
          <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
          <input type="number" min="1" placeholder="Usage limit (blank = unlimited)" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} />
          <label className="check-label full">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active
          </label>
          <div className="full row-actions">
            <button className="btn btn-primary btn-sm">Save coupon</button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="card-box">
        <table className="admin-table">
          <thead><tr><th>Code</th><th>Discount</th><th>Min spend</th><th>Expires</th><th>Used</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id}>
                <td><code className="coupon-code">{c.code}</code></td>
                <td>{c.type === "percent" ? `${c.value}%` : money(c.value)}</td>
                <td>{c.minSpend ? money(c.minSpend) : "—"}</td>
                <td>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-GB") : "Never"}</td>
                <td>{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                <td>{c.isActive ? <span className="pill ok">Active</span> : <span className="pill off">Inactive</span>}</td>
                <td className="row-actions">
                  <button className="ci-remove" onClick={() => startEdit(c)}>Edit</button>
                  <button className="ci-remove danger" onClick={() => remove(c)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
