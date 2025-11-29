import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { profile } = useProfile(user?.id);

  return (
    <div className="profile-page">
      <div className="gf-inner">

        {/* HEADER */}
        <div className="profile-header">
          <div className="profile-avatar-wrap">
            <img
              src={profile?.avatar_url}
              alt="avatar"
              className="profile-avatar"
            />
          </div>

          <h2 className="profile-name">{profile?.display_name}</h2>
          <p className="profile-email">{user?.email}</p>
          <p className="profile-bio">{profile?.bio || "No bio yet."}</p>
        </div>

        {/* STATS */}
        <div className="profile-stats">
          <div className="stat-box">
            <h3 className="stat-value">12</h3>
            <p className="stat-label">Wishlist</p>
          </div>

          <div className="stat-box">
            <h3 className="stat-value">4</h3>
            <p className="stat-label">Playing</p>
          </div>

          <div className="stat-box">
            <h3 className="stat-value">9</h3>
            <p className="stat-label">Completed</p>
          </div>
        </div>

        {/* RECENTLY PLAYED */}
        <div className="section">
          <h3>Recently Played</h3>
          <div className="recent-grid">
            <div className="recent-card"></div>
            <div className="recent-card"></div>
            <div className="recent-card"></div>
          </div>
        </div>

        {/* ACHIEVEMENTS */}
        <div className="section">
          <h3>Achievements</h3>
          <div className="achievements">
            <div className="badge">🏆 Starter</div>
            <div className="badge">🔥 10 Games Played</div>
            <div className="badge">⭐ Collector</div>
          </div>
        </div>

        {/* SETTINGS + LOGOUT */}
        <div className="section">
          <h3>Settings</h3>
          <div className="settings-card">
            <p>Update Profile</p>
            <p>Account Security</p>
            <p>Notifications</p>

            {/* LOGOUT BUTTON */}
            <button className="logout-btn" onClick={logout}>
              🚪 Logout
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
