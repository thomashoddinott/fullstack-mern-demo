import "./UpcomingClassRow.css";

export default function UpcomingClassRow({ title, date, status, color, icon }) {
  return (
    <div className="upcoming-class-row">
      <div className="upcoming-class-info">
        <div className={`upcoming-class-icon ${color}`}>
          <img
            src={icon}
            alt={`${title} icon`}
            className="upcoming-class-icon-img"
          />
        </div>

        <div>
          <div className="upcoming-class-title">{title}</div>
          <div className="upcoming-class-date">{date}</div>
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
            alert(`cancel: ${title}`);
          }}
          className="upcoming-class-cancel"
          aria-label={`Cancel ${title}`}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
