/* ============ HOMIVY — shared app logic ============ */

const CATEGORIES = {
  washroom: { name: "Washroom & Hygiene", tagline: "A fresher, cleaner bathroom every day" },
  kitchen: { name: "Kitchen Essentials", tagline: "Smart tools for effortless cooking" },
  decor: { name: "Home Decor", tagline: "Details that make a house a home" },
  household: { name: "Household Essentials", tagline: "Everyday solutions that just work" },
};

const FREE_SHIP_THRESHOLD = 25;
const money = (n) => "£" + n.toFixed(2);
const byHandle = (h) => PRODUCTS.find((p) => p.handle === h);

/* ---------- header & footer ---------- */
function renderChrome() {
  const path = location.pathname.split("/").pop() || "index.html";
  const active = (p) => (path === p ? "active" : "");
  document.getElementById("header").innerHTML = `
    <div class="wrap bar">
      <a href="index.html" class="logo"><span class="dot"></span>Homivy</a>
      <nav class="nav-links">
        <a href="index.html" class="${active("index.html")}">Home</a>
        <a href="shop.html" class="${active("shop.html")}">Shop All</a>
        <a href="shop.html?cat=washroom">Washroom</a>
        <a href="shop.html?cat=kitchen">Kitchen</a>
        <a href="shop.html?cat=decor">Decor</a>
      </nav>
      <div class="header-actions">
        <button class="cart-btn" onclick="openCart()" aria-label="Open cart">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 7h12l1.5 13h-15L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>
          <span class="lbl">Cart</span>
          <span class="cart-count" id="cartCount">0</span>
        </button>
        <button class="menu-btn" onclick="document.getElementById('mobileMenu').classList.add('open')" aria-label="Open menu">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>
        </button>
      </div>
    </div>`;

  document.getElementById("mobileMenu").innerHTML = `
    <button class="close-menu" onclick="this.parentElement.classList.remove('open')">✕</button>
    <a href="index.html">Home</a>
    <a href="shop.html">Shop All</a>
    <a href="shop.html?cat=washroom">Washroom</a>
    <a href="shop.html?cat=kitchen">Kitchen</a>
    <a href="shop.html?cat=decor">Decor</a>`;

  document.getElementById("footer").innerHTML = `
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <a href="index.html" class="logo"><span class="dot"></span>Homivy</a>
          <p class="about">Homivy helps you create a cleaner, more organized, and beautiful home — with essentials designed for everyday life.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            <li><a href="shop.html?cat=washroom">Washroom & Hygiene</a></li>
            <li><a href="shop.html?cat=kitchen">Kitchen Essentials</a></li>
            <li><a href="shop.html?cat=decor">Home Decor</a></li>
            <li><a href="shop.html?cat=household">Household Essentials</a></li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><a href="index.html#about">About Us</a></li>
            <li><a href="index.html#reviews">Reviews</a></li>
            <li><a href="shop.html">All Products</a></li>
          </ul>
        </div>
        <div>
          <h4>Support</h4>
          <ul>
            <li><a href="#">Shipping & Returns</a></li>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-mega">HOMIVY</div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} Homivy. All rights reserved.</span>
        <span>Free UK shipping over ${money(FREE_SHIP_THRESHOLD)}</span>
      </div>
    </div>`;

  document.getElementById("cartDrawer").innerHTML = `
    <div class="cart-head">
      <h3>Your Cart</h3>
      <button onclick="closeCart()" aria-label="Close cart">✕</button>
    </div>
    <div class="ship-progress" id="shipProgress"></div>
    <div class="cart-items" id="cartItems"></div>
    <div class="cart-foot" id="cartFoot"></div>`;
}

/* ---------- cart ---------- */
const loadCart = () => JSON.parse(localStorage.getItem("homivy-cart") || "[]");
const saveCart = (c) => localStorage.setItem("homivy-cart", JSON.stringify(c));

function cartCount() { return loadCart().reduce((s, i) => s + i.qty, 0); }
function cartSubtotal() {
  return loadCart().reduce((s, i) => { const p = byHandle(i.handle); return p ? s + p.price * i.qty : s; }, 0);
}

function addToCart(handle, qty = 1) {
  const cart = loadCart();
  const item = cart.find((i) => i.handle === handle);
  if (item) item.qty += qty; else cart.push({ handle, qty });
  saveCart(cart);
  updateCartBadge(true);
  renderCartDrawer();
  const p = byHandle(handle);
  toast(`${p ? p.title : "Item"} added to cart`);
  openCart();
}

function setQty(handle, qty) {
  let cart = loadCart();
  if (qty <= 0) cart = cart.filter((i) => i.handle !== handle);
  else { const item = cart.find((i) => i.handle === handle); if (item) item.qty = qty; }
  saveCart(cart);
  updateCartBadge();
  renderCartDrawer();
}

function updateCartBadge(bump = false) {
  const el = document.getElementById("cartCount");
  if (!el) return;
  el.textContent = cartCount();
  if (bump) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
}

function openCart() {
  renderCartDrawer();
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("cartOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

function renderCartDrawer() {
  const cart = loadCart();
  const sub = cartSubtotal();
  const itemsEl = document.getElementById("cartItems");
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - sub);
  const pct = Math.min(100, (sub / FREE_SHIP_THRESHOLD) * 100);

  document.getElementById("shipProgress").innerHTML = cart.length
    ? `<div class="msg">${remaining > 0
        ? `Add <b>${money(remaining)}</b> more for <b>free shipping</b>`
        : `🎉 You've unlocked <b>free shipping</b>!`}</div>
       <div class="ship-bar"><i style="width:${pct}%"></i></div>`
    : "";

  if (!cart.length) {
    itemsEl.innerHTML = `<div class="cart-empty">
      <div class="ico">🧺</div><b>Your cart is empty</b>
      <p>Beautiful home essentials are waiting for you.</p><br>
      <a href="shop.html" class="btn btn-primary btn-sm" onclick="closeCart()">Start shopping</a>
    </div>`;
  } else {
    itemsEl.innerHTML = cart.map((i) => {
      const p = byHandle(i.handle);
      if (!p) return "";
      return `<div class="cart-item">
        <a href="product.html?p=${p.handle}"><img src="${p.images[0]}" alt="${esc(p.title)}" loading="lazy"></a>
        <div class="ci-info">
          <a href="product.html?p=${p.handle}" class="ci-title">${esc(p.title)}</a>
          <div class="ci-price">${money(p.price * i.qty)}</div>
          <div class="ci-controls">
            <div class="ci-qty">
              <button onclick="setQty('${p.handle}', ${i.qty - 1})" aria-label="Decrease">−</button>
              <span>${i.qty}</span>
              <button onclick="setQty('${p.handle}', ${i.qty + 1})" aria-label="Increase">+</button>
            </div>
            <button class="ci-remove" onclick="setQty('${p.handle}', 0)">Remove</button>
          </div>
        </div>
      </div>`;
    }).join("");
  }

  document.getElementById("cartFoot").innerHTML = cart.length
    ? `<div class="cart-subtotal"><span>Subtotal</span><span>${money(sub)}</span></div>
       <div class="cart-note">Shipping & taxes calculated at checkout</div>
       <button class="btn btn-lime checkout-btn" onclick="toast('Checkout is a demo in this preview ✨')">
         Checkout <span class="arr">→</span>
       </button>`
    : "";
}

/* ---------- product cards ---------- */
function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

function productCard(p) {
  const save = p.compare ? Math.round((1 - p.price / p.compare) * 100) : 0;
  const alt = p.images[1]
    ? `<img class="alt" src="${p.images[1]}" alt="" loading="lazy">` : "";
  return `<article class="p-card">
    <a href="product.html?p=${p.handle}" class="p-media" aria-label="${esc(p.title)}">
      ${p.compare ? `<span class="sale-badge">−${save}%</span>` : ""}
      <img class="main ${p.images[1] ? "has-alt" : ""}" src="${p.images[0]}" alt="${esc(p.title)}" loading="lazy">
      ${alt}
      <button class="quick-add" onclick="event.preventDefault();addToCart('${p.handle}')" aria-label="Add to cart">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </button>
    </a>
    <div class="p-info">
      <span class="p-cat">${CATEGORIES[p.category].name}</span>
      <a href="product.html?p=${p.handle}" class="p-title">${esc(p.title)}</a>
      <div class="p-price-row">
        <span class="p-price">${money(p.price)}</span>
        ${p.compare ? `<span class="p-compare">${money(p.compare)}</span><span class="p-save">Save ${save}%</span>` : ""}
      </div>
    </div>
  </article>`;
}

/* ---------- toast ---------- */
let toastTimer;
function toast(msg) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast"; el.className = "toast";
    document.body.appendChild(el);
  }
  el.innerHTML = `<span class="check">✓</span> ${esc(msg)}`;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
}

/* ---------- scroll reveal ---------- */
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll("[data-reveal], .stagger").forEach((el) => io.observe(el));
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderChrome();
  updateCartBadge();
  document.getElementById("cartOverlay").addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });
  if (typeof initPage === "function") initPage();
  initReveal();
});
