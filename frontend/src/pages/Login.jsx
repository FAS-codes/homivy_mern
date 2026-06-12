import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      toast(`Welcome back, ${user.name.split(" ")[0]}!`);
      navigate(location.state?.from || (user.isAdmin ? "/admin" : "/"), { replace: true });
    } catch (err) {
      toast(err.userMessage, "error");
      setBusy(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="hero-bg" />
      <div className="auth-card card-box">
        <h1>Welcome back</h1>
        <p className="muted">Login to your Homivy account</p>
        <form onSubmit={submit}>
          <input type="email" required placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" required placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="btn btn-primary" disabled={busy}>{busy ? "Logging in…" : "Login"}</button>
        </form>
        <p className="auth-alt">New to Homivy? <Link to="/register" state={location.state}>Create an account</Link></p>
        <div className="demo-creds">
          <b>Demo accounts</b>
          <span>Customer — demo@homivy.com / demo123</span>
          <span>Admin — admin@homivy.com / admin123</span>
        </div>
      </div>
    </section>
  );
}
