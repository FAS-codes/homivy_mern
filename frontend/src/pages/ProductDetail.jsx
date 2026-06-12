import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { money } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import ProductCard from "../components/ProductCard.jsx";

export default function ProductDetail() {
  const { slug } = useParams();
  const { add } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQtyInput] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setImgIdx(0); setQtyInput(1); setNotFound(false);
    api.get(`/products/${slug}`)
      .then(async (res) => {
        const p = res.data.product;
        setProduct(p);
        const rel = await api.get(`/products?category=${p.category.slug}&limit=5`);
        setRelated(rel.data.products.filter((x) => x._id !== p._id).slice(0, 4));
        const rev = await api.get(`/reviews/product/${p._id}`);
        setReviews(rev.data.reviews);
        if (user) {
          const wl = await api.get("/wishlist");
          setInWishlist(wl.data.wishlist.products.some((x) => x._id === p._id));
        }
      })
      .catch(() => setNotFound(true));
  }, [slug, user]);

  if (notFound) return <div className="page-loading">Product not found. <Link to="/shop">Back to shop</Link></div>;
  if (!product) return <div className="page-loading">Loading…</div>;

  const save = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;
  const out = product.stock <= 0;

  const toggleWishlist = async () => {
    if (!user) return toast("Login to save items to your wishlist", "error");
    const res = await api.post(`/wishlist/${product._id}`);
    setInWishlist(res.data.added);
    toast(res.data.added ? "Added to wishlist" : "Removed from wishlist");
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/reviews", { product: product._id, ...reviewForm });
      toast(res.data.message);
      setReviewForm({ rating: 5, comment: "" });
    } catch (err) { toast(err.userMessage, "error"); }
  };

  return (
    <>
      <section className="pdp">
        <div className="wrap">
          <nav className="breadcrumbs">
            <Link to="/">Home</Link> / <Link to={`/shop?cat=${product.category.slug}`}>{product.category.name}</Link> / <span>{product.title}</span>
          </nav>
          <div className="pdp-grid">
            <div>
              <div className="gallery-main">
                {save > 0 && <span className="sale-badge">−{save}%</span>}
                <img src={product.images[imgIdx]} alt={product.fullTitle || product.title} key={imgIdx} />
              </div>
              {product.images.length > 1 && (
                <div className="gallery-thumbs">
                  {product.images.map((src, i) => (
                    <button key={i} className={i === imgIdx ? "active" : ""} onClick={() => setImgIdx(i)}>
                      <img src={src} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="pdp-info">
              <span className="p-cat">{product.category.name}</span>
              <h1>{product.fullTitle || product.title}</h1>
              <div className="pdp-rating">
                <span className="stars">{"★".repeat(Math.round(product.rating || 5))}</span>
                {product.numReviews > 0 ? `${product.rating} · ${product.numReviews} review${product.numReviews > 1 ? "s" : ""}` : "No reviews yet"}
              </div>
              <div className="pdp-price-row">
                <span className="pdp-price">{money(product.price)}</span>
                {save > 0 && <><span className="pdp-compare">{money(product.comparePrice)}</span><span className="p-save">Save {save}%</span></>}
              </div>
              <p className="pdp-short">{product.description}</p>
              <div className="stock-line">
                {out ? <span className="stock out">Out of stock</span>
                  : product.stock <= 5 ? <span className="stock low">Only {product.stock} left</span>
                  : <span className="stock in">✓ In stock</span>}
              </div>
              <div className="buy-row">
                <div className="qty">
                  <button onClick={() => setQtyInput(Math.max(1, qty - 1))}>−</button>
                  <input value={qty} readOnly />
                  <button onClick={() => setQtyInput(Math.min(product.stock, qty + 1))}>+</button>
                </div>
                <button className="btn btn-primary add-to-cart" disabled={out}
                  onClick={() => { add(product, qty); toast(`${product.title} added to cart`); }}>
                  {out ? "Out of stock" : <>Add to cart <span className="arr">→</span></>}
                </button>
                <button className={`btn-icon wish ${inWishlist ? "active" : ""}`} onClick={toggleWishlist} aria-label="Toggle wishlist">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M12 21s-7.5-4.8-10-9.3C.4 8 2 4.5 5.5 4 7.7 3.7 9.6 4.8 12 7c2.4-2.2 4.3-3.3 6.5-3 3.5.5 5.1 4 3.5 7.7-2.5 4.5-10 9.3-10 9.3z"/></svg>
                </button>
              </div>
              <div className="trust-row">
                <span>✓ Free shipping over £25</span>
                <span>✓ 30-day returns</span>
                <span>✓ Quality tested</span>
              </div>
              {product.features?.length > 0 && (
                <div className="feature-list">
                  <h3>Features & benefits</h3>
                  <ul>
                    {product.features.map((f, i) => (
                      <li key={i}><b>{f.t}</b>{f.d ? ` — ${f.d}` : ""}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head"><div><span className="kicker">Reviews</span><h2>What customers say</h2></div></div>
          {reviews.length === 0 ? (
            <p className="muted">No reviews yet — be the first once you've ordered this product.</p>
          ) : (
            <div className="testi-grid">
              {reviews.map((r) => (
                <div className="testi" key={r._id}>
                  <div className="stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                  <p>"{r.comment}"</p>
                  <div className="who">
                    <div className="ava">{r.user.name.slice(0, 2).toUpperCase()}</div>
                    <div><b>{r.user.name}</b><span>{new Date(r.createdAt).toLocaleDateString("en-GB")}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {user && (
            <form className="review-form" onSubmit={submitReview}>
              <h3>Write a review</h3>
              <div className="star-input">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} className={n <= reviewForm.rating ? "on" : ""}
                    onClick={() => setReviewForm({ ...reviewForm, rating: n })}>★</button>
                ))}
              </div>
              <textarea required placeholder="Share your experience with this product…" value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} />
              <button className="btn btn-primary btn-sm" type="submit">Submit review</button>
              <small className="muted">Reviews are moderated and require a purchase of this product.</small>
            </form>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="section-head"><div><span className="kicker">Keep exploring</span><h2>You may also like</h2></div></div>
            <div className="product-grid">
              {related.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
