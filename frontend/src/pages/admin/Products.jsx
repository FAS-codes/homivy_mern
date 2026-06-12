import { useEffect, useState } from "react";
import api, { money } from "../../api.js";
import { useToast } from "../../context/ToastContext.jsx";

const EMPTY = { title: "", price: "", comparePrice: "", stock: 20, category: "", description: "", images: "", isActive: true };

export default function Products() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null); // null | "new" | product
  const [form, setForm] = useState(EMPTY);
  const [q, setQ] = useState("");

  const load = () => api.get("/products?limit=100&includeInactive=true").then((res) => setProducts(res.data.products));
  useEffect(() => {
    load();
    api.get("/categories").then((res) => setCategories(res.data.categories));
  }, []);

  const startEdit = (p) => {
    if (p) {
      setEditing(p._id);
      setForm({ title: p.title, price: p.price, comparePrice: p.comparePrice || "", stock: p.stock,
        category: p.category?._id || p.category, description: p.description, images: p.images.join("\n"), isActive: p.isActive });
    } else { setEditing("new"); setForm({ ...EMPTY, category: categories[0]?._id || "" }); }
    window.scrollTo(0, 0);
  };

  const save = async (e) => {
    e.preventDefault();
    const body = {
      ...form,
      price: +form.price,
      comparePrice: form.comparePrice ? +form.comparePrice : null,
      stock: +form.stock,
      images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editing === "new") await api.post("/products", body);
      else await api.put(`/products/${editing}`, body);
      toast("Product saved");
      setEditing(null);
      load();
    } catch (err) { toast(err.userMessage, "error"); }
  };

  const remove = async (p) => {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${p._id}`);
      toast("Product deleted");
      load();
    } catch (err) { toast(err.userMessage, "error"); }
  };

  const shown = products.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="admin-head-row">
        <h1 className="admin-title">Products ({products.length})</h1>
        <div className="row-actions">
          <input className="search-input" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn btn-primary btn-sm" onClick={() => startEdit(null)}>+ New product</button>
        </div>
      </div>

      {editing && (
        <form className="card-box form-grid" onSubmit={save}>
          <h3 className="full">{editing === "new" ? "New product" : "Edit product"}</h3>
          <input required placeholder="Title *" className="full" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input required type="number" step="0.01" min="0" placeholder="Price (£) *" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input type="number" step="0.01" min="0" placeholder="Compare-at price (£)" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} />
          <input required type="number" min="0" placeholder="Stock *" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="">Category…</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <textarea placeholder="Description" className="full" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <textarea placeholder="Image URLs (one per line)" className="full" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
          <label className="check-label full">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active (visible in store)
          </label>
          <div className="full row-actions">
            <button className="btn btn-primary btn-sm">Save product</button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="card-box">
        <table className="admin-table">
          <thead><tr><th></th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Sold</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p._id}>
                <td><img className="t-img" src={p.images[0]} alt="" /></td>
                <td>{p.title}</td>
                <td>{p.category?.name}</td>
                <td>{money(p.price)}{p.comparePrice ? <small className="muted"> / {money(p.comparePrice)}</small> : null}</td>
                <td className={p.stock <= 5 ? "warn-text" : ""}>{p.stock}</td>
                <td>{p.sold}</td>
                <td>{p.isActive ? <span className="pill ok">Active</span> : <span className="pill off">Hidden</span>}</td>
                <td className="row-actions">
                  <button className="ci-remove" onClick={() => startEdit(p)}>Edit</button>
                  <button className="ci-remove danger" onClick={() => remove(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
