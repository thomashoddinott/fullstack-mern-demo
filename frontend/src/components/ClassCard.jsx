import "./ClassCard.css";

const classStyles = {
  "BJJ - GI": {
    color: "bg-red-600",
    logo: "https://static.thenounproject.com/png/631848-200.png",
  },
  "BJJ - NOGI": {
    color: "bg-gray-500",
    logo: "https://static.thenounproject.com/png/1995411-200.png",
  },
  "Yoga Flow": {
    color: "bg-green-500",
    logo: "https://static.thenounproject.com/png/1995732-200.png",
  },
  "Strength & Conditioning": {
    color: "bg-orange-500",
    logo: "https://static.thenounproject.com/png/1980371-200.png",
  },
};

export default function ClassCard({ title, teacher, datetime, spots }) {
  const style = classStyles[title] || { color: "bg-gray-400", logo: "" };

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
