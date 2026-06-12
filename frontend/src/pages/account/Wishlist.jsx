import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { money } from "../../api.js";
import { useCart } from "../../context/CartContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export default function Wishlist() {
  const [products, setProducts] = useState(null);
  const { add } = useCart();
  const toast = useToast();

  const load = () => api.get("/wishlist").then((res) => setProducts(res.data.wishlist.products));
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    await api.post(`/wishlist/${id}`);
    toast("Removed from wishlist");
    load();
  };

  if (!products) return <div className="card-box">Loading…</div>;
  if (products.length === 0) {
    return (
      <div className="card-box empty-state">
        <div className="big">Your wishlist is empty</div>
        <p>Tap the heart on any product to save it for later.</p>
        <Link to="/shop" className="btn btn-primary btn-sm" style={{ marginTop: 14 }}>Browse products</Link>
      </div>
    );
  }

  return (
    <div className="card-box">
      <h3>Wishlist ({products.length})</h3>
      <div className="order-list">
        {products.map((p) => (
          <div className="order-row" key={p._id}>
            <Link to={`/product/${p.slug}`}><img className="wish-img" src={p.images[0]} alt={p.title} /></Link>
            <div className="order-meta">
              <Link to={`/product/${p.slug}`}><b>{p.title}</b></Link>
              <small>{p.category?.name} · {p.stock > 0 ? "In stock" : "Out of stock"}</small>
            </div>
            <b>{money(p.price)}</b>
            <div className="row-actions">
              <button className="btn btn-primary btn-sm" disabled={p.stock <= 0}
                onClick={() => { add(p); toast(`${p.title} added to cart`); }}>Add to cart</button>
              <button className="ci-remove" onClick={() => remove(p._id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
