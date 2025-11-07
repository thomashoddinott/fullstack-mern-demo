import './UserCard.css';

export default function UserCard() {
  return (
    <div className="user-card">
      <img
        src="https://randomuser.me/api/portraits/men/32.jpg"
        alt="User"
        className="user-avatar"
      />
      <h2 className="user-name">John Doe</h2>
      <p className="user-rank">Blue Belt</p>
      <span className="user-status">
        <span className="status-dot"></span>
        Active
      </span>

      <div className="subscription-card">
        <div className="subscription-header">
          <p>Subscription</p>
          <span className="subscription-badge">Premium</span>
        </div>
        <p className="subscription-expiry">Expires: March 15, 2024</p>
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
      </div>

      <div className="quick-stats">
        <p className="quick-stats-title">Quick Stats</p>
        <div className="quick-stats-list">
          <div className="stat-row">
            <span>Classes This Month</span>
            <span>12</span>
          </div>
          <div className="stat-row">
            <span>Total Classes</span>
            <span>156</span>
          </div>
          <div className="stat-row">
            <span>Favorite Class</span>
            <span>BJJ Gi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
