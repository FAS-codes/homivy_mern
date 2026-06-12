import { useEffect, useState } from "react";
import api, { money } from "../../api.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function Inventory() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [edits, setEdits] = useState({});

  const load = () => api.get("/products?limit=100&includeInactive=true&sort=name").then((res) => setProducts(res.data.products));
  useEffect(() => { load(); }, []);

  const save = async (p) => {
    const stock = +edits[p._id];
    if (Number.isNaN(stock) || stock < 0) return toast("Enter a valid stock number", "error");
    try {
      await api.put(`/admin/inventory/${p._id}`, { stock });
      toast(`Stock updated for ${p.title}`);
      setEdits((e) => { const n = { ...e }; delete n[p._id]; return n; });
      load();
    } catch (err) { toast(err.userMessage, "error"); }
  };

  const totalUnits = products.reduce((s, p) => s + p.stock, 0);
  const lowCount = products.filter((p) => p.stock <= 5).length;

  return (
    <>
      <h1 className="admin-title">Inventory</h1>
      <div className="stat-cards">
        <div className="stat-card"><span>Total units in stock</span><b>{totalUnits}</b></div>
        <div className="stat-card"><span>Products</span><b>{products.length}</b></div>
        <div className={`stat-card ${lowCount ? "alert" : ""}`}><span>Low / out of stock</span><b>{lowCount}</b></div>
      </div>
      <div className="card-box">
        <table className="admin-table">
          <thead><tr><th></th><th>Product</th><th>Price</th><th>Sold</th><th>Stock</th><th>Update stock</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className={p.stock === 0 ? "row-danger" : p.stock <= 5 ? "row-warn" : ""}>
                <td><img className="t-img" src={p.images[0]} alt="" /></td>
                <td>{p.title}</td>
                <td>{money(p.price)}</td>
                <td>{p.sold}</td>
                <td><b>{p.stock}</b></td>
                <td className="row-actions">
                  <input type="number" min="0" className="stock-input" placeholder={p.stock}
                    value={edits[p._id] ?? ""} onChange={(e) => setEdits({ ...edits, [p._id]: e.target.value })} />
                  <button className="btn btn-primary btn-sm" disabled={edits[p._id] == null || edits[p._id] === ""} onClick={() => save(p)}>Save</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
