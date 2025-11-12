import "./UpcomingClasses.css";
import UpcomingClassRow from "./UpcomingClassRow";

export default function UpcomingClasses() {
  const classes = [
    {
      title: "BJJ Gi - Fundamentals",
      date: "Today, 6:00 PM - 7:30 PM",
      status: "Confirmed",
      color: "bg-red-600",
      icon: "https://static.thenounproject.com/png/631848-200.png",
    },
    {
      title: "Morning Yoga Flow",
      date: "Tomorrow, 8:00 AM - 9:00 AM",
      status: "Waitlist",
      color: "bg-green-500",
      icon: "https://static.thenounproject.com/png/1995732-200.png",
    },
  ];

  return (
    <>
      <h2 className="upcoming-classes-title">Your Upcoming Classes</h2>
      <div className="upcoming-classes-container">
        <div className="upcoming-classes-list">
          {classes.map((c, i) => (
            <UpcomingClassRow key={i} {...c} />
          ))}
        </div>
      </div>
    </>
  );
}
