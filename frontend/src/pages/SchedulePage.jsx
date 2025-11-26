import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function SchedulePage() {
  const { data: scheduled, isLoading, isError } = useQuery({
    queryKey: ["scheduled-classes"],
    queryFn: () => axios.get('/api/scheduled-classes').then((res) => res.data),
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

  const events = (scheduled || []).map((s) => ({
    id: s.id,
    title: s.title || s.name || s.title,
    start: s.start,
    end: s.end,
    backgroundColor: s.backgroundColor,
  }));

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
