import { Link } from "react-router-dom";
import { money } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function ProductCard({ product }) {
  const { add } = useCart();
  const toast = useToast();
  const save = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;
  const out = product.stock <= 0;

  return (
    <article className="p-card">
      <Link to={`/product/${product.slug}`} className="p-media">
        {save > 0 && <span className="sale-badge">−{save}%</span>}
        {out && <span className="sale-badge out">Out of stock</span>}
        <img className={`main ${product.images[1] ? "has-alt" : ""}`} src={product.images[0]} alt={product.title} loading="lazy" />
        {product.images[1] && <img className="alt" src={product.images[1]} alt="" loading="lazy" />}
        {!out && (
          <button
            className="quick-add"
            onClick={(e) => { e.preventDefault(); add(product); toast(`${product.title} added to cart`); }}
            aria-label="Add to cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        )}
      </Link>
      <div className="p-info">
        <span className="p-cat">{product.category?.name || ""}</span>
        <Link to={`/product/${product.slug}`} className="p-title">{product.title}</Link>
        {product.numReviews > 0 && (
          <span className="p-rating">★ {product.rating} ({product.numReviews})</span>
        )}
        <div className="p-price-row">
          <span className="p-price">{money(product.price)}</span>
          {save > 0 && (
            <>
              <span className="p-compare">{money(product.comparePrice)}</span>
              <span className="p-save">Save {save}%</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
