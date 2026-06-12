import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AccountLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="page-hero" style={{ paddingBottom: 80 }}>
      <div className="hero-bg" />
      <div className="wrap">
        <h1>My Account</h1>
        <p>Hi {user.name.split(" ")[0]} — manage your orders, details and saved items.</p>
        <div className="account-layout">
          <nav className="account-nav card-box">
            <NavLink to="/account/profile">Profile & Password</NavLink>
            <NavLink to="/account/orders">Order History</NavLink>
            <NavLink to="/account/wishlist">Wishlist</NavLink>
            <NavLink to="/account/addresses">Saved Addresses</NavLink>
            {user.isAdmin && <NavLink to="/admin" className="admin-link">Admin Dashboard</NavLink>}
            <button onClick={() => { logout(); navigate("/"); }}>Logout</button>
          </nav>
          <div className="account-content">
            <Outlet />
          </div>
        </div>
      </div>
    </section>
  );
}
