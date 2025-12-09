import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getClassStyle } from "../constants/classStyles";

export default function SchedulePage() {
  const queryClient = useQueryClient();

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
        eventClick={async (info) => {
          const classId = info.event.id ?? info.event.extendedProps?._id;

          const eventIdStr = String(classId);
          const isBooked =
            bookedResp?.booked_classes_id?.includes(classId) ||
            bookedResp?.booked_classes_id?.includes(eventIdStr);

          if (isBooked) {
            const ok = window.confirm(`You are subscribed to "${info.event.title}". Unsubscribe?`);
            if (!ok) return;
            try {
              await axios.put(`/api/users/0/booked-classes`, { action: "remove", classId });
              await axios.put(`/api/scheduled-classes/${classId}/minus1`);
              queryClient.invalidateQueries(["booked-classes", 0]);
              queryClient.invalidateQueries(["booked-classes-id", 0]);
              queryClient.invalidateQueries(["scheduled-classes"]);
              window.alert("Unsubscribed from class");
            } catch (err) {
              console.error(err);
              window.alert("Error unsubscribing from class");
            }
          } else {
            const ok = window.confirm(`Subscribe to "${info.event.title}"?`);
            if (!ok) return;
            try {
              await axios.put(`/api/users/0/booked-classes`, { action: "add", classId });
              await axios.put(`/api/scheduled-classes/${classId}/plus1`);
              queryClient.invalidateQueries(["booked-classes", 0]);
              queryClient.invalidateQueries(["booked-classes-id", 0]);
              queryClient.invalidateQueries(["scheduled-classes"]);
              window.alert("Subscribed to class");
            } catch (err) {
              console.error(err);
              window.alert("Error subscribing to class");
            }
          }
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
