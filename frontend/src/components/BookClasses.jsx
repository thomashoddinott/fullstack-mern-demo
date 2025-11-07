import "./BookClasses.css";
import { useNavigate } from "react-router-dom";
import ClassCard from "./ClassCard";

export default function BookClasses() {
  const navigate = useNavigate();

  return (
    <div className="book-classes">
      <div className="book-classes-header">
        <h2 className="book-classes-title">Book Classes</h2>

        <div className="book-classes-controls">
          <select className="book-classes-select">
            <option>This Week</option>
            <option>Next Week</option>
            <option>All Classes</option>
          </select>

          <button
            onClick={() => navigate("/schedule")}
            className="book-classes-button"
          >
            View Full Schedule
          </button>
        </div>
      </div>

      <div className="book-classes-grid">
        <ClassCard
          title="BJJ - GI"
          teacher="Matteo"
          datetime="07/11 | 6:00 PM - 7:30 PM"
          spots="8/15 spots"
        />
        <ClassCard
          title="BJJ - NOGI"
          teacher="Matteo"
          datetime="07/11 | 6:00 PM - 7:30 PM"
          spots="8/15 spots"
        />
        <ClassCard
          title="Yoga Flow"
          teacher="Matteo"
          datetime="07/11 | 6:00 PM - 7:30 PM"
          spots="8/15 spots"
        />
        <ClassCard
          title="Strength & Conditioning"
          teacher="Matteo"
          datetime="07/11 | 6:00 PM - 7:30 PM"
          spots="8/15 spots"
        />
      </div>
    </div>
  );
}
