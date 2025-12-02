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
          <span className="subscription-badge">{user.subscription.type}</span>
        </div>
        <p className="subscription-expiry">Expires: {formattedExpiry}</p>
        <div className="progress-bar">
          <div className="progress-fill"></div>
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
