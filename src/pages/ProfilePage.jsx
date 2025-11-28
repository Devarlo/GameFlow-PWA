import "./ProfilePage.css";
import { useAuth } from "../hooks/useAuth";

function ProfilePage() {
  const { user, logout } = useAuth();

  // Dummy data — nanti bisa diambil dari MyGamesPage/Supabase
  const playedCount = 12;
  const wishlistCount = 5;
  const recentPlayed = [
    "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.png",
    "https://images.igdb.com/igdb/image/upload/t_cover_big/co1x5r.png",
    "https://images.igdb.com/igdb/image/upload/t_cover_big/co6g6z.png",
  ];

  const achievements = [
    "🎮 Game Explorer",
    "🔥 RPG Enthusiast",
    "⭐ Reviewer",
    "📌 Collector",
  ];

  return (
    <div className="profile-container">
      {/* HEADER */}
      <div className="profile-header">
        <img
          src={
            user?.avatar ||
            `https://ui-avatars.com/api/?name=${user?.name || "Guest"}`
          }
          alt="avatar"
          className="avatar"
        />

        <h2 className="username">{user?.name || "Guest User"}</h2>
        {user && <p className="email">{user.email}</p>}

        {/* Login / Logout Button */}
        {!user ? (
          <a href="/login" className="login-btn">
            Login / Register
          </a>
        ) : (
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        )}
      </div>

      {/* STATS */}
      <div className="stats-section">
        <div className="stat-card">
          <span className="value">{playedCount}</span>
          <span className="label">Played</span>
        </div>

        <div className="stat-card">
          <span className="value">{wishlistCount}</span>
          <span className="label">Wishlist</span>
        </div>
      </div>

      {/* RECENTLY PLAYED */}
      <div className="section">
        <h3>Recently Played</h3>
        <div className="recent-grid">
          {recentPlayed.map((img, i) => (
            <img key={i} src={img} alt="recent" className="recent-game" />
          ))}
        </div>
      </div>

      {/* ACHIEVEMENTS */}
      <div className="section">
        <h3>Achievements</h3>
        <div className="badges">
          {achievements.map((badge, i) => (
            <div key={i} className="badge">
              {badge}
            </div>
          ))}
        </div>
      </div>

      {/* SETTINGS */}
      <div className="section">
        <h3>Settings</h3>
        <div className="settings-card">
          <p>⚙ Edit Profile</p>
          <p>🔔 Notification Settings</p>
          <p>❓ About GameFlow</p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
