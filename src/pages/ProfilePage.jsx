import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { profile } = useProfile(user?.id);

  const displayName = profile?.display_name || "Guest Player";
  const avatar = profile?.avatar_url || "/default-avatar.png";

  return (
    <div className="profile-page">
      <div className="gf-inner">
        
        {/* TOP HEADER */}
        <div className="profile-header ps-card">
          <div className="profile-avatar-wrap">
            <img src={avatar} alt="avatar" className="profile-avatar" />
          </div>

          <div className="profile-info">
            <h2 className="profile-name">{displayName}</h2>
            <p className="profile-email">{user?.email || "guest@example.com"}</p>

            <p className="profile-bio">
              {profile?.bio || "No bio yet. Update your profile to add more info."}
            </p>
          </div>
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
          <h3 className="section-title">Recently Played</h3>
          <div className="recent-grid">
            <div className="recent-card"></div>
            <div className="recent-card"></div>
            <div className="recent-card"></div>
          </div>
        </div>


        {/* ACHIEVEMENTS */}
        <div className="section">
          <h3 className="section-title">Achievements</h3>

          <div className="achievements">
            <div className="badge ps-badge">🏆 Starter</div>
            <div className="badge ps-badge">🔥 10 Games Played</div>
            <div className="badge ps-badge">⭐ Collector</div>
          </div>
        </div>


        {/* SETTINGS */}
        <div className="section">
          <h3 className="section-title">Settings</h3>

          <div className="settings-card ps-card">
            <p>Update Profile</p>
            <p>Account Security</p>
            <p>Notifications</p>

            {/* LOGOUT BUTTON */}
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
