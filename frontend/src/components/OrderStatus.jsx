const LABELS = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  "out-for-delivery": "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }) {
  return <span className={`status-badge s-${status}`}>{LABELS[status] || status}</span>;
}

const FLOW = ["processing", "shipped", "out-for-delivery", "delivered"];

export function OrderTimeline({ order }) {
  if (order.status === "cancelled") {
    return <div className="timeline-cancelled">This order was cancelled.</div>;
  }
  const reached = FLOW.indexOf(order.status);
  const historyMap = {};
  order.statusHistory?.forEach((h) => (historyMap[h.status] = h));
  return (
    <div className="timeline">
      {FLOW.map((step, i) => (
        <div key={step} className={`t-step ${i <= reached ? "done" : ""} ${i === reached ? "current" : ""}`}>
          <div className="t-dot" />
          <div className="t-info">
            <b>{LABELS[step]}</b>
            {historyMap[step] && (
              <small>
                {new Date(historyMap[step].at).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                {historyMap[step].note ? ` — ${historyMap[step].note}` : ""}
              </small>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
