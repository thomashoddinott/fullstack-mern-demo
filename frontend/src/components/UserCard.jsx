import React, { useRef, useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import "./UserCard.css";

export default function UserCard() {
  // Fetch user data
  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useQuery({
    queryKey: ["user", 0],
    queryFn: () => axios.get(`/api/users/0`).then((res) => res.data),
  });

  // Fetch avatar separately
  const {
    data: avatar,
    isLoading: isAvatarLoading,
    isError: isAvatarError,
  } = useQuery({
    queryKey: ["avatar", 0],
    queryFn: () =>
      axios
        .get(`/api/users/0/avatar`, { responseType: "blob" })
        .then((res) => URL.createObjectURL(res.data)),
    enabled: !!user, // only fetch avatar once user exists
  });

  // Fetch plan label for display (map plan_id -> label)
  const planId = user?.subscription?.plan_id;
  const { data: planData } = useQuery({
    queryKey: ["plan", planId],
    queryFn: () => axios.get(`/api/plans/${planId}`).then((r) => r.data),
    enabled: !!planId,
    staleTime: 1000 * 60 * 5,
  });

  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: ({ userId, file }) => {
      const fd = new FormData();
      fd.append("avatar", file);
      return axios.put(`/api/users/${userId}/avatar`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onMutate: () => setIsUploading(true),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries(["avatar", variables.userId]);
    },
    onSettled: () => setIsUploading(false),
  });

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const userId = user?.id ?? 0;
    uploadMutation.mutate({ userId, file });
    // clear the input so same file can be selected again if needed
    e.target.value = "";
  }

  if (isUserLoading || isAvatarLoading) {
    return <div className="user-card">Loading...</div>;
  }

  if (isUserError || !user || isAvatarError) {
    return <div className="user-card">Error loading user</div>;
  }

  // Format subscription expiry
  const expiryRaw = user.subscription?.expiry;
  let formattedExpiry = expiryRaw ?? "N/A";
  if (expiryRaw) {
    const d = new Date(expiryRaw);
    if (!isNaN(d)) {
      formattedExpiry = d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  // Calculate subscription progress percentage
  let progressPercent = 0;
  try {
    const today = new Date();
    const expiryDate = user.subscription?.expiry ? new Date(user.subscription.expiry) : null;
    let startDate = user.subscription?.start ? new Date(user.subscription.start) : null;

    // If no explicit start date, fall back to the first day of the expiry month
    if (!startDate && expiryDate) {
      startDate = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), 1);
    }

    if (startDate && expiryDate) {
      const total = expiryDate.getTime() - startDate.getTime();
      const elapsed = today.getTime() - startDate.getTime();
      if (total > 0) {
        progressPercent = Math.round((elapsed / total) * 100);
        if (progressPercent < 0) progressPercent = 0;
        if (progressPercent > 100) progressPercent = 100;
      }
    }
  } catch {
    progressPercent = 0;
  }

  // Defensive clamp to guarantee percent stays within 0-100
  let safePercent = Number.isFinite(progressPercent) ? progressPercent : 0;
  safePercent = Math.max(0, Math.min(100, safePercent));


  return (
    <div className="user-card">
      <div className="user-avatar-container">
        <img
          src={avatar}
          alt="User"
          className="user-avatar"
          onClick={handleAvatarClick}
        />
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
          user.status === "Inactive" ? "user-status--inactive" : ""
        }`}
      >
        <span
          className={`status-dot ${
            user.status === "Inactive" ? "status-dot--inactive" : ""
          }`}
        ></span>
        {user.status}
      </span>

      <div className="subscription-card">
        <div className="subscription-header">
          <p>Subscription</p>
          <span className="subscription-badge">{planData?.label ?? user.subscription?.plan_id ?? "—"}</span>
        </div>
        <p className="subscription-expiry">Expires: {formattedExpiry}</p>
        <div className="progress-bar">
          <div
            className={`progress-fill ${safePercent > 90 ? 'progress-fill--nearing-end' : ''}`}
            style={{ width: `${safePercent}%` }}
            aria-valuenow={safePercent}
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
  );
}
