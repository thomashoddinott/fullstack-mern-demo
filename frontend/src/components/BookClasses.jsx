import "./BookClasses.css";
import { useNavigate } from "react-router-dom";
import ClassCard from "./ClassCard";
import { classes } from "../data/classes";

const formatClassTime = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dateOptions = { month: "2-digit", day: "2-digit" };
  const timeOptions = { hour: "numeric", minute: "numeric", hour12: true };
  const formattedDate = startDate.toLocaleDateString("en-US", dateOptions);
  const formattedStartTime = startDate.toLocaleTimeString("en-US", timeOptions);
  const formattedEndTime = endDate.toLocaleTimeString("en-US", timeOptions);
  return `${formattedDate} | ${formattedStartTime} - ${formattedEndTime}`;
};

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
        {classes.slice(0, 4).map((classItem) => (
          <ClassCard
            key={classItem.id}
            title={classItem.title}
            teacher={classItem.teacher}
            datetime={formatClassTime(classItem.start, classItem.end)}
            spots={`${classItem.spots_available}/${classItem.spots_total} spots`}
          />
        ))}
      </div>
    </div>
  );
}
