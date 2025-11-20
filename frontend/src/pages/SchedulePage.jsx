import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { classes } from "../data/classes";

export default function SchedulePage() {
  return (
    <div className="pt-20 px-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Weekly Schedule</h1>

      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        events={classes}
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
