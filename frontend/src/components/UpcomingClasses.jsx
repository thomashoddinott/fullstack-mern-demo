import "./UpcomingClasses.css";
import UpcomingClassRow from "./UpcomingClassRow";
import { getClassStyle } from "../constants/classStyles";

export default function UpcomingClasses() {
  const classes = [
    {
      title: "BJJ Gi - Fundamentals",
      date: "Today, 6:00 PM - 7:30 PM",
      status: "Confirmed",
    },
    {
      title: "Morning Yoga Flow",
      date: "Tomorrow, 8:00 AM - 9:00 AM",
      status: "Waitlist",
    },
  ];

  return (
    <>
      <h2 className="upcoming-classes-title">Your Upcoming Classes</h2>
      <div className="upcoming-classes-container">
        <div className="upcoming-classes-list">
          {classes.map((c, i) => {
            const style = getClassStyle(c.title);
            return (
              <UpcomingClassRow
                key={i}
                {...c}
                color={style.color}
                icon={style.logo}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
