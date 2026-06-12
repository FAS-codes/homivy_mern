import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <Link to="/" className="logo"><span className="dot" />Homivy</Link>
            <p className="about">Homivy helps you create a cleaner, more organized, and beautiful home — with essentials designed for everyday life.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li><Link to="/shop?cat=washroom">Washroom & Hygiene</Link></li>
              <li><Link to="/shop?cat=kitchen">Kitchen Essentials</Link></li>
              <li><Link to="/shop?cat=decor">Home Decor</Link></li>
              <li><Link to="/shop?cat=household">Household Essentials</Link></li>
            </ul>
          </div>
          <div>
            <h4>Account</h4>
            <ul>
              <li><Link to="/account/orders">My Orders</Link></li>
              <li><Link to="/account/wishlist">Wishlist</Link></li>
              <li><Link to="/cart">Cart</Link></li>
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
        <div className="footer-mega">HOMIVY</div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Homivy. All rights reserved.</span>
          <span>Free UK shipping over £25</span>
        </div>
      </div>
    </footer>
  );
}
