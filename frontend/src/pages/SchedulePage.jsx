import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getClassStyle } from "../constants/classStyles";

export default function SchedulePage() {
  const { data: scheduled, isLoading, isError } = useQuery({
    queryKey: ["scheduled-classes"],
    queryFn: () => axios.get('/api/scheduled-classes').then((res) => res.data),
  });

  // fetch the user's booked class ids so we can mark booked classes with a check
  const { data: bookedResp } = useQuery({
    queryKey: ["booked-classes-id", 0],
    queryFn: () => axios.get(`/api/users/0/booked-classes-id`).then((r) => r.data),
    staleTime: 1000 * 60 * 1,
  });

  if (isLoading) {
    return (
      <div className="pt-20 px-6 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Weekly Schedule</h1>
        <div>Loading schedule...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pt-20 px-6 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Weekly Schedule</h1>
        <div>Error loading schedule</div>
      </div>
    );
  }

  const bookedIds = new Set(bookedResp?.booked_classes_id || []);

  const events = (scheduled || []).map((s) => {
    const classId = s.id ?? s._id;
    let title = s.title || s.name || "";
    const style = getClassStyle(title) || {};
    if (classId && bookedIds.has(classId)) {
      title = `${title} ✅`;
    }
    return {
      id: classId,
      title,
      start: s.start,
      end: s.end,
      backgroundColor: style.hexColor,
    };
  });

  return (
    <div className="pt-20 px-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Weekly Schedule</h1>

      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        events={events}
        eventClick={(info) => {
          alert(`Book class: ${info.event.title}`);
        }}
        height="auto"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridWeek,timeGridDay",
        }}
      />
    </div>
  );
}
