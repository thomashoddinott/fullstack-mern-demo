import "./ClassCard.css";
import { getClassStyle } from "../constants/classStyles";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ClassCard({
  id,
  title,
  teacher,
  datetime,
  spots,
  disabled = false, // I think this needs refactoring, disabled initially meant "already booked"
  isFull = false,
}) {
  const style = getClassStyle(title);
  const queryClient = useQueryClient();

  const addBookingMutation = useMutation({
    mutationFn: async (classId) => {
      const resp = await axios.put(`/api/users/0/booked-classes`, { action: "add", classId });
      // increment spots_booked on the scheduled class
      await axios.put(`/api/scheduled-classes/${classId}/plus1`);
      return resp.data;
    },
    onMutate: async (classId) => {
      await queryClient.cancelQueries(["booked-classes-id", 0]);
      const prev = queryClient.getQueryData(["booked-classes-id", 0]);

      queryClient.setQueryData(["booked-classes-id", 0], (old) => ({
        ...old,
        booked_classes_id: [...(old?.booked_classes_id || []), classId],
      }));

      return { prev };
    },
    onError: (err, vars, context) => {
      queryClient.setQueryData(["booked-classes-id", 0], context.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["booked-classes-id", 0]);
      queryClient.invalidateQueries(["booked-classes", 0]);
      queryClient.invalidateQueries(["scheduled-classes"]);
    },
  });

  return (
    <div className="class-card">
      {/* Header */}
      <div className={`class-card-header ${style.color}`}>
        <img
          src={style.logo}
          alt={`${title} logo`}
          className="class-card-logo"
        />
      </div>

      {/* Body */}
      <div className="class-card-body">
        <h3 className="class-card-title">{title}</h3>
        <p className="class-card-teacher">Teacher: {teacher}</p>

        <div className="class-card-info">
          <div className="class-card-info-row">
            <span>🕕</span>
            <span>{datetime}</span>
          </div>
          <div className="class-card-info-row">
            <span>👥</span>
            <span>{spots}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="class-card-footer">
        <button
          className={`class-card-button ${style.color} ${
            (disabled || isFull) ? "class-card-button--disabled" : ""
          }`}
          onClick={() => {
            if (disabled || isFull || addBookingMutation.isLoading) return;
            if (!id) return;
            addBookingMutation.mutate(id);
          }}
          disabled={disabled || isFull || addBookingMutation.isLoading}
        >
          {isFull
            ? "Class Full"
            : disabled
            ? "Already Booked"
            : addBookingMutation.isLoading
            ? "Booking..."
            : "Book Class"}
        </button>
      </div>
    </div>
  );
}
