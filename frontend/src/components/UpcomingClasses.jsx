import "./UpcomingClasses.css"
import "./UpcomingClasses.css"
import UpcomingClassRow from "./UpcomingClassRow"
import { getClassStyle } from "../constants/classStyles"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

export default function UpcomingClasses() {
  // 1) fetch booked class ids for user 0
  const {
    data: bookedResp,
    isLoading: isBookedLoading,
    isError: isBookedError,
  } = useQuery({
    queryKey: ["booked-classes-id", 0],
    queryFn: () => axios.get(`/api/users/0/booked-classes-id`).then((r) => r.data),
  })

  // 2) once we have booked ids, fetch each scheduled class and map to { title, date }
  const {
    data: classes,
    isLoading: isClassesLoading,
    isError: isClassesError,
  } = useQuery({
    queryKey: ["booked-classes", 0],
    queryFn: async () => {
      const ids = bookedResp?.booked_classes_id ?? []
      if (!ids || ids.length === 0) return []
      const results = await Promise.all(
        ids.map((id) => axios.get(`/api/scheduled-classes/${id}`).then((r) => r.data))
      )
      // sort chronologically by start date, then map to expected shape for UpcomingClassRow
      results.sort((a, b) => new Date(a.start) - new Date(b.start))
      return results.map((r) => ({ title: r.title, date: r.start, id: r.id }))
    },
    enabled: Array.isArray(bookedResp?.booked_classes_id),
  })

  const loading = isBookedLoading || isClassesLoading
  const error = isBookedError || isClassesError

  const queryClient = useQueryClient()

  const removeMutation = useMutation({
    mutationFn: async ({ classId }) => {
      const resp = await axios.put(`/api/users/0/booked-classes`, { action: "remove", classId })
      // decrement spots_booked for the scheduled class
      await axios.put(`/api/scheduled-classes/${classId}/minus1`)
      return resp.data
    },
    // optimistic update
    onMutate: async ({ classId }) => {
      await queryClient.cancelQueries(["booked-classes", 0])
      await queryClient.cancelQueries(["booked-classes-id", 0])

      const previousClasses = queryClient.getQueryData(["booked-classes", 0])
      const previousIds = queryClient.getQueryData(["booked-classes-id", 0])

      // optimistically remove from booked-classes list
      if (previousClasses) {
        queryClient.setQueryData(["booked-classes", 0], (old) =>
          (old || []).filter((c) => c.id !== classId)
        )
      }

      if (previousIds) {
        queryClient.setQueryData(["booked-classes-id", 0], (old) => ({
          booked_classes_id: (old?.booked_classes_id || []).filter((i) => i !== classId),
        }))
      }

      return { previousClasses, previousIds }
    },
    onError: (_err, variables, context) => {
      // rollback
      if (context?.previousClasses) {
        queryClient.setQueryData(["booked-classes", 0], context.previousClasses)
      }
      if (context?.previousIds) {
        queryClient.setQueryData(["booked-classes-id", 0], context.previousIds)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(["booked-classes", 0])
      queryClient.invalidateQueries(["booked-classes-id", 0])
      queryClient.invalidateQueries(["scheduled-classes"])
    },
  })

  if (loading) {
    return <div className="upcoming-classes-container">Loading upcoming classes...</div>
  }

  if (error) {
    return <div className="upcoming-classes-container">Error loading upcoming classes</div>
  }

  if (!classes || classes.length === 0) {
    return (
      <div>
        <h2 className="upcoming-classes-title">Your Upcoming Classes</h2>
        <div className="upcoming-classes-container">
          <div className="upcoming-classes-list">You have no upcoming classes.</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <h2 className="upcoming-classes-title">Your Upcoming Classes</h2>
      <div className="upcoming-classes-container">
        <div className="upcoming-classes-list">
          {classes.map((c) => {
            const style = getClassStyle(c.title)
            return (
              <UpcomingClassRow
                key={c.id}
                id={c.id}
                title={c.title}
                date={c.date}
                color={style.color}
                icon={style.logo}
                onRemove={() => removeMutation.mutate({ classId: c.id })}
              />
            )
          })}
        </div>
      </div>
    </>
  )
}
