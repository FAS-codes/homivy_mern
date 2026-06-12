import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const cat = params.get("cat") || "all";
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api.get("/products", { params: { category: cat, q, sort, limit: 48 } })
        .then((res) => setProducts(res.data.products))
        .finally(() => setLoading(false));
    }, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [cat, q, sort]);

  const active = categories.find((c) => c.slug === cat);

  return (
    <>
      <section className="page-hero">
        <div className="hero-bg" />
        <div className="wrap">
          <h1>{active ? active.name : "Shop All"}</h1>
          <p>{active ? active.tagline + "." : "Everything you need for a cleaner, more organized, and beautiful home."}</p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="shop-toolbar">
            <div className="filter-chips">
              <button className={`chip ${cat === "all" ? "active" : ""}`} onClick={() => setParams({})}>All Products</button>
              {categories.map((c) => (
                <button key={c.slug} className={`chip ${cat === c.slug ? "active" : ""}`} onClick={() => setParams({ cat: c.slug })}>
                  {c.name}
                </button>
              ))}
            </div>
            <div className="toolbar-right">
              <input type="search" className="search-input" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
              <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">Sort: Featured</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="name">Name: A–Z</option>
              </select>
            </div>
          </div>
          <div className="results-count">{loading ? "Loading…" : `${products.length} product${products.length === 1 ? "" : "s"}`}</div>
          {!loading && products.length === 0 ? (
            <div className="empty-state"><div className="big">No products found</div><p>Try a different search or category.</p></div>
          ) : (
            <div className="product-grid">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
