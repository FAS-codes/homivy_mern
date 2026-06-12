import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [heroProducts, setHeroProducts] = useState([]);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.categories));
    api.get("/products?sort=featured&limit=8").then((res) => setFeatured(res.data.products));
    api.get("/products?category=decor&limit=3").then((res) => setHeroProducts(res.data.products));
  }, []);

  const marquee = ["Free UK shipping over £25", "30-day easy returns", "New drops every month", "Up to 65% off sale picks", "Trusted by thousands of homes"];

  return (
    <>
      <section className="hero">
        <div className="hero-bg" /><div className="hero-grid" />
        <div className="wrap hero-inner">
          <div>
            <span className="hero-eyebrow"><span className="spark">✦</span> Home essentials, reimagined for 2026</span>
            <h1>Your home,<br />but <span className="accent">effortlessly</span> beautiful.</h1>
            <p className="lede">Homivy helps you create a cleaner, more organized, and beautiful home — with thoughtfully chosen essentials for every room, from washroom to kitchen.</p>
            <div className="hero-ctas">
              <Link to="/shop" className="btn btn-primary">Shop the collection <span className="arr">→</span></Link>
              <a href="#categories" className="btn btn-ghost">Explore rooms</a>
            </div>
            <div className="hero-stats">
              <div className="stat"><b>20+</b><span>Curated essentials</span></div>
              <div className="stat"><b>4.9★</b><span>Customer rating</span></div>
              <div className="stat"><b>48h</b><span>Fast dispatch</span></div>
            </div>
          </div>
          <div className="hero-visual">
            {heroProducts[0] && <div className="hero-card c1"><img src={heroProducts[heroProducts.length - 1].images[0]} alt="" /></div>}
            {heroProducts[1] && <div className="hero-card c2"><img src={heroProducts[1].images[0]} alt="" /></div>}
            {heroProducts[2] && <div className="hero-card c3"><img src={heroProducts[0].images[0]} alt="" /></div>}
            <div className="hero-chip h1"><div className="ico">🚚</div><div>Free shipping<small>on orders over £25</small></div></div>
            <div className="hero-chip h2"><div className="ico">★</div><div>4.9 / 5 rating<small>from happy homes</small></div></div>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...marquee, ...marquee].map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </div>

      <section id="categories">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="kicker">Shop by room</span>
              <h2>Every corner,<br />covered.</h2>
            </div>
            <p>From spa-fresh washrooms to kitchens that work as hard as you do — find exactly what your space needs.</p>
          </div>
          <div className="bento">
            {["decor", "washroom", "kitchen", "household"].map((slug) => {
              const c = categories.find((x) => x.slug === slug);
              if (!c) return null;
              return (
                <Link className="cat-card" to={`/shop?cat=${c.slug}`} key={c.slug}>
                  <img src={c.image} alt={c.name} loading="lazy" />
                  <div className="cat-info">
                    <div><h3>{c.name}</h3><small>{c.productCount} products · {c.tagline}</small></div>
                    <span className="go"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 17L17 7M9 7h8v8"/></svg></span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="kicker">Bestsellers</span>
              <h2>Loved by<br />thousands of homes.</h2>
            </div>
            <Link to="/shop" className="btn btn-ghost btn-sm">View all products <span className="arr">→</span></Link>
          </div>
          <div className="product-grid">
            {featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="values">
            <h2>Why homes choose <em>Homivy</em></h2>
            <div className="values-grid">
              {[
                ["01", "Curated, not cluttered", "Every product is hand-picked to solve a real everyday problem — no filler, no gimmicks."],
                ["02", "Quality you can feel", "Durable materials and smart design, tested for daily life in real homes."],
                ["03", "Fair, honest pricing", "Premium home essentials without the premium markup — with free shipping over £25."],
                ["04", "Hassle-free returns", "Changed your mind? 30-day easy returns, no questions asked."],
              ].map(([num, h, p]) => (
                <div className="value-item" key={num}>
                  <span className="num">{num}</span><h3>{h}</h3><p>{p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
