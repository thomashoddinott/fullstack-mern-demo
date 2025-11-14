import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function SchedulePage() {
  // --- Dummy weekly schedule (Mon–Sun) ---
  // You can expand or randomize later.
  const events = [
    {
      title: "BJJ – Gi",
      start: "2025-11-10T07:00",
      end: "2025-11-10T08:00",
      backgroundColor: "#7EC2B9",
    },
    {
      title: "BJJ – No-Gi",
      start: "2025-11-10T09:30",
      end: "2025-11-10T10:30",
      backgroundColor: "#C7E76D",
    },
    {
      title: "Yoga Flow",
      start: "2025-11-11T08:00",
      end: "2025-11-11T09:00",
      backgroundColor: "#9DC4E5",
    },
    {
      title: "Strength & Conditioning",
      start: "2025-11-12T10:00",
      end: "2025-11-12T11:00",
      backgroundColor: "#F7D47B",
    },

    // Repeat a few for weekly structure
    {
      title: "BJJ – Gi",
      start: "2025-11-13T19:00",
      end: "2025-11-13T20:15",
      backgroundColor: "#7EC2B9",
    },
    {
      title: "BJJ – No-Gi",
      start: "2025-11-14T18:00",
      end: "2025-11-14T19:00",
      backgroundColor: "#C7E76D",
    },
    {
      title: "Strength & Conditioning",
      start: "2025-11-15T13:00",
      end: "2025-11-15T14:00",
      backgroundColor: "#F7D47B",
    },
    {
      title: "Yoga Flow",
      start: "2025-11-16T17:00",
      end: "2025-11-16T18:00",
      backgroundColor: "#9DC4E5",
    },
  ];

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
