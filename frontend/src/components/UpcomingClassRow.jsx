import "./UpcomingClassRow.css";

function formatDateString(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function UpcomingClassRow({ id, title, date, status = "Confirmed", color, icon, onRemove }) {
  const formatted = formatDateString(date);

  return (
    <div className="upcoming-class-row">
      <div className="upcoming-class-info">
        <div className={`upcoming-class-icon ${color}`}>
          <img src={icon} alt={`${title} icon`} className="upcoming-class-icon-img" />
        </div>

        <div>
          <div className="upcoming-class-title">{title}</div>
          <div className="upcoming-class-date">{formatted}</div>
        </div>
      </div>

      <div className="upcoming-class-right">
        <span
          className={`upcoming-class-status ${
            status === "Confirmed"
              ? "status-confirmed"
              : status === "Waitlist"
              ? "status-waitlist"
              : "status-cancelled"
          }`}
        >
          {status}
        </span>
        <button
          onClick={() => {
            if (typeof onRemove === "function") onRemove(id);
          }}
          className="upcoming-class-cancel"
          aria-label={`Cancel ${title}`}>
          ✕
        </button>
      </div>
    </div>
  );
}
