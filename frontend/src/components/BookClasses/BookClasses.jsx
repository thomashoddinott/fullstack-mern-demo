import "./BookClasses.css"
import { useNavigate } from "react-router-dom"
import ClassCard from "../ClassCard/ClassCard"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "../../hooks/useAuth"
import axios from "axios"
import { getAuthToken } from "../../utils/api"

export function formatClassTime(start, end) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const dateOptions = { month: "2-digit", day: "2-digit" }
  const timeOptions = { hour: "numeric", minute: "numeric", hour12: true }
  const formattedDate = startDate.toLocaleDateString("en-US", dateOptions)
  const formattedStartTime = startDate.toLocaleTimeString("en-US", timeOptions)
  const formattedEndTime = endDate.toLocaleTimeString("en-US", timeOptions)
  return `${formattedDate} | ${formattedStartTime} - ${formattedEndTime}`
}

export default function BookClasses() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const userId = currentUser?.uid

  // fetch the first 4 scheduled classes from the backend
  const {
    data: classes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["scheduled-classes", { limit: 4 }],
    queryFn: () => axios.get("/api/scheduled-classes?limit=4").then((r) => r.data),
  })

  // fetch teachers to resolve teacherIds -> teacher names
  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => axios.get("/api/teachers").then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  })

  // fetch the user's booked class ids so we can disable booking for already-booked classes
  const { data: bookedResp } = useQuery({
    queryKey: ["booked-classes-id", userId],
    queryFn: async () => {
      const token = await getAuthToken()
      return axios
        .get(`/api/users/${userId}/booked-classes-id`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((r) => r.data)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 1,
  })
  const bookedIds = bookedResp?.booked_classes_id ?? []

  // fetch the current user so we can check subscription status and block booking when Inactive
  const { data: user } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const token = await getAuthToken()
      return axios
        .get(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((r) => r.data)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 1,
  })
  const isSubscriptionInactive = user?.subscription?.status === "Inactive"

  const teacherMap = (teachers || []).reduce((acc, t) => {
    acc[t.id] = t
    return acc
  }, {})

  return (
    <div className="book-classes">
      <div className="book-classes-header">
        <h2 className="book-classes-title">Book Classes</h2>

        <div className="book-classes-controls">
          {/* <select className="book-classes-select">
            <option>This Week</option>
            <option>Next Week</option>
            <option>All Classes</option>
          </select> */}

          <button onClick={() => navigate("/schedule")} className="book-classes-button">
            View Full Schedule
          </button>
        </div>
      </div>

      <div className="book-classes-grid">
        {isLoading ? (
          <div>Loading classes...</div>
        ) : isError ? (
          <div>Error loading classes</div>
        ) : (
          classes.map((classItem) => {
            // expected shapes:
            // - scheduled class: { _id, id, title/name, start, end, teacher, spots_* }
            // - class type: { _id, name, description, teacherIds }

            const rawTitle = classItem.title || classItem.name || "Class"
            const title = rawTitle.replace(/[–—]/g, " - ")

            let teacher = "Staff"
            if (Array.isArray(classItem.teacherIds) && classItem.teacherIds.length > 0) {
              const t = teacherMap[classItem.teacherIds[0]]
              if (t) teacher = t.name
            } else if (classItem.teacher) {
              teacher = classItem.teacher
            }

            const datetime = classItem.start
              ? formatClassTime(classItem.start, classItem.end)
              : classItem.description || ""
            const spots =
              classItem.spots_booked !== undefined && classItem.spots_total !== undefined
                ? `${classItem.spots_booked}/${classItem.spots_total} spots`
                : "—"

            const key = classItem.id ?? classItem._id ?? title

            const isFull =
              classItem.spots_booked !== undefined && classItem.spots_total !== undefined
                ? classItem.spots_booked >= classItem.spots_total
                : false

            return (
              <ClassCard
                key={key}
                id={classItem.id ?? classItem._id}
                title={title}
                teacher={teacher}
                datetime={datetime}
                spots={spots}
                // Also disable booking when the user's subscription is Inactive
                disabled={
                  bookedIds.includes(classItem.id ?? classItem._id) ||
                  isFull ||
                  isSubscriptionInactive
                }
                subscriptionInactive={isSubscriptionInactive}
                isFull={isFull}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
