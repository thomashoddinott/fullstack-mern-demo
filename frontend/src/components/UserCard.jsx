import React from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import "./UserCard.css";

export default function UserCard() {
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user", 0],
    queryFn: () => axios.get(`/api/users/0`).then((res) => res.data),
  });

  if (isLoading) {
    return <div className="user-card">Loading...</div>;
  }

  if (isError || !user) {
    return <div className="user-card">Error loading user</div>;
  }
  // Format subscription expiry to a friendly date (e.g. March 15, 2024)
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
      {/* <img src={user.avatar} alt="User" className="user-avatar" /> */}
      <div className="user-avatar-container">
        <img
          src={user.avatar}
          alt="User"
          className="user-avatar"
          onClick={() => alert("Change Profile Pic")}
        />
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
