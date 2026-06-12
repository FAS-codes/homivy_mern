import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const NAV = [
  ["/admin", "Dashboard", true],
  ["/admin/products", "Products"],
  ["/admin/categories", "Categories"],
  ["/admin/orders", "Orders"],
  ["/admin/customers", "Customers"],
  ["/admin/inventory", "Inventory"],
  ["/admin/reports", "Sales Reports"],
  ["/admin/coupons", "Coupons"],
  ["/admin/reviews", "Reviews"],
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link to="/" className="logo"><span className="dot" />Homivy</Link>
        <span className="admin-tag">Admin</span>
        <nav>
          {NAV.map(([to, label, end]) => (
            <NavLink key={to} to={to} end={!!end}>{label}</NavLink>
          ))}
        </nav>
        <div className="admin-side-foot">
          <small>{user.email}</small>
          <Link to="/">← Back to store</Link>
          <button onClick={() => { logout(); navigate("/"); }}>Logout</button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
