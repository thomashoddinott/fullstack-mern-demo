import React, { useRef, useState } from "react"
import axios from "axios"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "../../hooks/useAuth"
import { getAuthToken } from "../../utils/api"
import "./UserCard.css"

export default function UserCard() {
  const { currentUser } = useAuth()

  // Fetch user data
  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useQuery({
    queryKey: ["user", currentUser?.uid],
    queryFn: async () => {
      const token = await getAuthToken()
      return axios
        .get(`/api/users/${currentUser?.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => res.data)
    },
    enabled: !!currentUser?.uid,
  })

  // Fetch avatar separately
  const {
    data: avatar,
    isLoading: isAvatarLoading,
    isError: isAvatarError,
  } = useQuery({
    queryKey: ["avatar", currentUser?.uid],
    queryFn: async () => {
      const token = await getAuthToken()
      return axios
        .get(`/api/users/${currentUser?.uid}/avatar`, {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => URL.createObjectURL(res.data))
    },
    enabled: !!user && !!currentUser?.uid, // only fetch avatar once user exists
  })

  // Fetch plan label for display (map plan_id -> label)
  const planId = user?.subscription?.plan_id
  const { data: planData } = useQuery({
    queryKey: ["plan", planId],
    queryFn: () => axios.get(`/api/plans/${planId}`).then((r) => r.data),
    enabled: !!planId,
    staleTime: 1000 * 60 * 5,
  })

  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)

  const uploadMutation = useMutation({
    mutationFn: async ({ userId, file }) => {
      const token = await getAuthToken()
      const fd = new FormData()
      fd.append("avatar", file)
      return axios.put(`/api/users/${userId}/avatar`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
    },
    onMutate: () => setIsUploading(true),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries(["avatar", variables.userId])
    },
    onSettled: () => setIsUploading(false),
  })

  function handleAvatarClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const userId = user?.id ?? 0
    uploadMutation.mutate({ userId, file })
    // clear the input so same file can be selected again if needed
    e.target.value = ""
  }

  if (isUserLoading || isAvatarLoading) {
    return <div className="user-card">Loading...</div>
  }

  if (isUserError || !user || isAvatarError) {
    return <div className="user-card">Error loading user</div>
  }

  // Format subscription expiry
  const expiryRaw = user.subscription?.expiry
  let formattedExpiry = expiryRaw ?? "N/A"
  if (expiryRaw) {
    const d = new Date(expiryRaw)
    if (!isNaN(d)) {
      formattedExpiry = d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
  }
  const isSubscriptionInactive = user.subscription?.status === "Inactive"
  // Compute subscription progress percentage (0-100)
  function computeSubscriptionProgress(subscription) {
    try {
      const today = new Date()
      const expiryDate = subscription?.expiry ? new Date(subscription.expiry) : null
      let startDate = subscription?.start ? new Date(subscription.start) : null

      // If no explicit start date, fall back to the first day of the expiry month
      if (!startDate && expiryDate) {
        startDate = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), 1)
      }

      if (startDate && expiryDate) {
        const total = expiryDate.getTime() - startDate.getTime()
        const elapsed = today.getTime() - startDate.getTime()
        if (total > 0) {
          let pct = Math.round((elapsed / total) * 100)
          if (!Number.isFinite(pct)) pct = 0
          return Math.max(0, Math.min(100, pct))
        }
      }
    } catch {
      // fall through
    }
    return 0
  }

  const subscriptionProgress = computeSubscriptionProgress(user.subscription)

  return (
    <div className="user-card">
      <div className="user-avatar-container">
        <img src={avatar} alt="User" className="user-avatar" onClick={handleAvatarClick} />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        {isUploading && <div className="avatar-uploading">Uploading...</div>}
        <span className="avatar-edit-icon">✍️</span>
      </div>
      <h2 className="user-name">{user.name}</h2>
      <p className="user-rank">{user.rank}</p>
      <span
        className={`user-status ${
          user.subscription.status === "Inactive" ? "user-status--inactive" : ""
        }`}
      >
        <span
          className={`status-dot ${
            user.subscription.status === "Inactive" ? "status-dot--inactive" : ""
          }`}
        ></span>
        {user.subscription.status}
      </span>

      <div className="subscription-card">
        <div className="subscription-header">
          <p>Subscription</p>
          <span className="subscription-badge">
            {planData?.label ?? user.subscription?.plan_id ?? "—"}
          </span>
        </div>
        <p
          className={`subscription-expiry ${isSubscriptionInactive ? "subscription-expiry--expired" : ""}`}
        >
          {isSubscriptionInactive ? "Expired:" : "Expires:"} {formattedExpiry}
        </p>
        <div className="progress-bar">
          <div
            className={`progress-fill ${subscriptionProgress > 90 ? "progress-fill--nearing-end" : ""}`}
            style={{ width: `${subscriptionProgress}%` }}
            aria-valuenow={subscriptionProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
      </div>

      <div className="quick-stats">
        <p className="quick-stats-title">Quick Stats</p>
        <div className="quick-stats-list">
          <div className="stat-row">
            <span>Classes This Month</span>
            <span>{user.stats.classes_this_month}</span>
          </div>
          <div className="stat-row">
            <span>Total Classes</span>
            <span>{user.stats.total_classes}</span>
          </div>
          <div className="stat-row">
            <span>Favorite Class</span>
            <span>{user.stats.favorite_class}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
