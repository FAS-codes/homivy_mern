import { useEffect, useState } from "react";
import api from "../../api.js";
import { useToast } from "../../context/ToastContext.jsx";

const EMPTY = { name: "", tagline: "", image: "" };

export default function Categories() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const load = () => api.get("/categories").then((res) => setCategories(res.data.categories));
  useEffect(() => { load(); }, []);

  const startEdit = (c) => {
    if (c) { setEditing(c._id); setForm({ name: c.name, tagline: c.tagline, image: c.image }); }
    else { setEditing("new"); setForm(EMPTY); }
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing === "new") await api.post("/categories", form);
      else await api.put(`/categories/${editing}`, form);
      toast("Category saved");
      setEditing(null);
      load();
    } catch (err) { toast(err.userMessage, "error"); }
  };

  const remove = async (c) => {
    if (!confirm(`Delete "${c.name}"?`)) return;
    try {
      await api.delete(`/categories/${c._id}`);
      toast("Category deleted");
      load();
    } catch (err) { toast(err.userMessage, "error"); }
  };

  return (
    <>
      <div className="admin-head-row">
        <h1 className="admin-title">Categories</h1>
        <button className="btn btn-primary btn-sm" onClick={() => startEdit(null)}>+ New category</button>
      </div>

      {editing && (
        <form className="card-box form-grid" onSubmit={save}>
          <input required placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Tagline" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
          <input placeholder="Image URL" className="full" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <div className="full row-actions">
            <button className="btn btn-primary btn-sm">Save</button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="card-box">
        <table className="admin-table">
          <thead><tr><th></th><th>Name</th><th>Slug</th><th>Tagline</th><th>Products</th><th></th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id}>
                <td>{c.image && <img className="t-img" src={c.image} alt="" />}</td>
                <td><b>{c.name}</b></td>
                <td><code>{c.slug}</code></td>
                <td>{c.tagline}</td>
                <td>{c.productCount}</td>
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
