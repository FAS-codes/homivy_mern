import { useEffect, useState } from "react";
import api from "../../api.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function Reviews() {
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("pending");

  const load = () => api.get(`/reviews?status=${filter}`).then((res) => setReviews(res.data.reviews));
  useEffect(() => { load(); }, [filter]);

  const moderate = async (r, status) => {
    await api.put(`/reviews/${r._id}/moderate`, { status });
    toast(`Review ${status}`);
    load();
  };

  const remove = async (r) => {
    if (!confirm("Delete this review permanently?")) return;
    await api.delete(`/reviews/${r._id}`);
    toast("Review deleted");
    load();
  };

  return (
    <>
      <div className="admin-head-row">
        <h1 className="admin-title">Review Moderation</h1>
        <div className="filter-chips">
          {["pending", "approved", "rejected", "all"].map((s) => (
            <button key={s} className={`chip ${filter === s ? "active" : ""}`} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="card-box"><p className="muted">No {filter !== "all" ? filter : ""} reviews.</p></div>
      ) : reviews.map((r) => (
        <div className="card-box review-mod" key={r._id}>
          <img className="t-img" src={r.product?.images?.[0]} alt="" />
          <div className="review-body">
            <div className="review-top">
              <b>{r.product?.title}</b>
              <span className={`pill ${r.status === "approved" ? "ok" : r.status === "rejected" ? "off" : "warn"}`}>{r.status}</span>
            </div>
            <div className="stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
            <p>"{r.comment}"</p>
            <small className="muted">{r.user?.name} ({r.user?.email}) · {new Date(r.createdAt).toLocaleDateString("en-GB")}</small>
          </div>
          <div className="row-actions vertical">
            {r.status !== "approved" && <button className="btn btn-primary btn-sm" onClick={() => moderate(r, "approved")}>Approve</button>}
            {r.status !== "rejected" && <button className="btn btn-ghost btn-sm" onClick={() => moderate(r, "rejected")}>Reject</button>}
            <button className="ci-remove danger" onClick={() => remove(r)}>Delete</button>
          </div>
        </div>
      ))}
    </>
  );
}
