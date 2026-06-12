import { useState } from "react";
import api from "../../api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const EMPTY = { label: "Home", fullName: "", phone: "", line1: "", line2: "", city: "", postcode: "", country: "United Kingdom", isDefault: false };

export default function Addresses() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(null); // null | "new" | addrId
  const [form, setForm] = useState(EMPTY);

  const startEdit = (addr) => {
    if (addr) { setEditing(addr._id); setForm({ ...addr }); }
    else { setEditing("new"); setForm(EMPTY); }
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const res = editing === "new"
        ? await api.post("/users/addresses", form)
        : await api.put(`/users/addresses/${editing}`, form);
      setUser({ ...user, addresses: res.data.addresses });
      setEditing(null);
      toast("Address saved");
    } catch (err) { toast(err.userMessage, "error"); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this address?")) return;
    const res = await api.delete(`/users/addresses/${id}`);
    setUser({ ...user, addresses: res.data.addresses });
    toast("Address deleted");
  };

  const makeDefault = async (addr) => {
    const res = await api.put(`/users/addresses/${addr._id}`, { isDefault: true });
    setUser({ ...user, addresses: res.data.addresses });
    toast("Default address updated");
  };

  return (
    <div className="card-box">
      <div className="order-head">
        <h3>Saved Addresses</h3>
        <button className="btn btn-primary btn-sm" onClick={() => startEdit(null)}>+ Add address</button>
      </div>

      {user.addresses.length === 0 && !editing && <p className="muted">No saved addresses yet.</p>}

      <div className="addr-grid">
        {user.addresses.map((a) => (
          <div className={`addr-card ${a.isDefault ? "default" : ""}`} key={a._id}>
            {a.isDefault && <span className="default-tag">Default</span>}
            <b>{a.label}</b>
            <p>{a.fullName}<br />{a.line1}{a.line2 ? <><br />{a.line2}</> : null}<br />{a.city}, {a.postcode}<br />{a.country}</p>
            <div className="row-actions">
              <button className="ci-remove" onClick={() => startEdit(a)}>Edit</button>
              {!a.isDefault && <button className="ci-remove" onClick={() => makeDefault(a)}>Set default</button>}
              <button className="ci-remove danger" onClick={() => remove(a._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <form className="form-grid" onSubmit={save} style={{ marginTop: 20 }}>
          <input placeholder="Label (Home, Work…)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          <input required placeholder="Full name *" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input required placeholder="Address line 1 *" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
          <input placeholder="Address line 2" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
          <input required placeholder="City *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input required placeholder="Postcode *" value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} />
          <input placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          <label className="check-label full">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} /> Set as default address
          </label>
          <div className="full row-actions">
            <button className="btn btn-primary btn-sm" type="submit">Save address</button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
