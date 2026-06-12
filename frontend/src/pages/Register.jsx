import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast("Passwords do not match", "error");
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
      toast("Welcome to Homivy!");
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      toast(err.userMessage, "error");
      setBusy(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="hero-bg" />
      <div className="auth-card card-box">
        <h1>Create account</h1>
        <p className="muted">Join Homivy for faster checkout, order tracking and wishlists</p>
        <form onSubmit={submit}>
          <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="email" required placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" required minLength={6} placeholder="Password (min 6 characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input type="password" required placeholder="Confirm password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          <button className="btn btn-primary" disabled={busy}>{busy ? "Creating account…" : "Create account"}</button>
        </form>
        <p className="auth-alt">Already have an account? <Link to="/login" state={location.state}>Login</Link></p>
      </div>
    </section>
  );
}
