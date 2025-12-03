import "./UpcomingClasses.css";
import "./UpcomingClasses.css";
import UpcomingClassRow from "./UpcomingClassRow";
import { getClassStyle } from "../constants/classStyles";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function UpcomingClasses() {
  // 1) fetch booked class ids for user 0
  const {
    data: bookedResp,
    isLoading: isBookedLoading,
    isError: isBookedError,
  } = useQuery({
    queryKey: ["booked-classes-id", 0],
    queryFn: () => axios.get(`/api/users/0/booked-classes-id`).then((r) => r.data),
  });

  // 2) once we have booked ids, fetch each scheduled class and map to { title, date }
  const {
    data: classes,
    isLoading: isClassesLoading,
    isError: isClassesError,
  } = useQuery({
    queryKey: ["booked-classes", 0],
    queryFn: async () => {
      const ids = bookedResp?.booked_classes_id ?? [];
      if (!ids || ids.length === 0) return [];
      const results = await Promise.all(
        ids.map((id) => axios.get(`/api/scheduled-classes/${id}`).then((r) => r.data))
      );
      // map to expected shape for UpcomingClassRow: title and date (date = start)
      return results.map((r) => ({ title: r.title, date: r.start, id: r.id }));
    },
    enabled: !!bookedResp,
  });

  const loading = isBookedLoading || isClassesLoading;
  const error = isBookedError || isClassesError;

  if (loading) {
    return <div className="upcoming-classes-container">Loading upcoming classes...</div>;
  }

  if (error) {
    return <div className="upcoming-classes-container">Error loading upcoming classes</div>;
  }

  if (!classes || classes.length === 0) {
    return (
      <div>
        <h2 className="upcoming-classes-title">Your Upcoming Classes</h2>
        <div className="upcoming-classes-container">
          <div className="upcoming-classes-list">You have no upcoming classes.</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="upcoming-classes-title">Your Upcoming Classes</h2>
      <div className="upcoming-classes-container">
        <div className="upcoming-classes-list">
          {classes.map((c) => {
            const style = getClassStyle(c.title);
            return (
              <UpcomingClassRow
                key={c.id}
                title={c.title}
                date={c.date}
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
