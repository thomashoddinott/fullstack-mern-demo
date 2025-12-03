import "./ClassCard.css";
import { getClassStyle } from "../constants/classStyles";

export default function ClassCard({ title, teacher, datetime, spots }) {
  const style = getClassStyle(title);

  return (
    <div className="class-card">
      {/* Header */}
      <div className={`class-card-header ${style.color}`}>
        <img src={style.logo} alt={`${title} logo`} className="class-card-logo" />
      </div>

      {/* Body */}
      <div className="class-card-body">
        <h3 className="class-card-title">{title}</h3>
        <p className="class-card-teacher">Teacher: {teacher}</p>

        <div className="class-card-info">
          <div className="class-card-info-row">
            <span>🕕</span>
            <span>{datetime}</span>
          </div>
          <div className="class-card-info-row">
            <span>👥</span>
            <span>{spots}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="class-card-footer">
        <button
          className={`class-card-button ${style.color}`}
          onClick={() => alert("Book Class: " + title)}
        >
          Book Class
        </button>
      </div>
    </div>
  );
}
