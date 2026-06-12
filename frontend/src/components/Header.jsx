import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => { setMenuOpen(false); setUserOpen(false); };
  const handleLogout = () => { logout(); close(); navigate("/"); };

  return (
    <>
      <header className="site-header">
        <div className="wrap bar">
          <Link to="/" className="logo" onClick={close}><span className="dot" />Homivy</Link>
          <nav className="nav-links">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/shop">Shop All</NavLink>
            <NavLink to="/shop?cat=washroom">Washroom</NavLink>
            <NavLink to="/shop?cat=kitchen">Kitchen</NavLink>
            <NavLink to="/shop?cat=decor">Decor</NavLink>
          </nav>
          <div className="header-actions">
            <div className="user-menu">
              <button className="btn-icon" onClick={() => setUserOpen(!userOpen)} aria-label="Account">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg>
                {user && <span className="user-dot" />}
              </button>
              {userOpen && (
                <div className="dropdown" onClick={close}>
                  {user ? (
                    <>
                      <div className="dropdown-head">Hi, {user.name.split(" ")[0]}</div>
                      <Link to="/account/profile">My Profile</Link>
                      <Link to="/account/orders">My Orders</Link>
                      <Link to="/account/wishlist">Wishlist</Link>
                      <Link to="/account/addresses">Addresses</Link>
                      {user.isAdmin && <Link to="/admin" className="admin-link">Admin Dashboard</Link>}
                      <button onClick={handleLogout}>Logout</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login">Login</Link>
                      <Link to="/register">Create account</Link>
                    </>
                  )}
                </div>
              )}
            </div>
            <Link to="/cart" className="cart-btn" onClick={close}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 7h12l1.5 13h-15L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>
              <span className="lbl">Cart</span>
              <span className="cart-count">{count}</span>
            </Link>
            <button className="menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <button className="close-menu" onClick={close}>✕</button>
        <Link to="/" onClick={close}>Home</Link>
        <Link to="/shop" onClick={close}>Shop All</Link>
        <Link to="/cart" onClick={close}>Cart</Link>
        {user ? (
          <>
            <Link to="/account/orders" onClick={close}>My Account</Link>
            {user.isAdmin && <Link to="/admin" onClick={close}>Admin</Link>}
            <a onClick={handleLogout} role="button">Logout</a>
          </>
        ) : (
          <Link to="/login" onClick={close}>Login</Link>
        )}
      </div>
    </>
  );
}
