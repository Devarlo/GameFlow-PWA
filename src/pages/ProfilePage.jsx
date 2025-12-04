import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { getMyGamesByUser } from "../services/myGamesService";
import { updateProfile, uploadAvatar, changePassword } from "../services/ProfileService";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { profile, refreshProfile } = useProfile(user && user.id);

  const [displayNameInput, setDisplayNameInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("/default-avatar.png");
  const [avatarFile, setAvatarFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [myGames, setMyGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);

  // Sync local form state when profile changes
  useEffect(() => {
    if (!profile) return;
    setDisplayNameInput(profile.display_name || "");
    setBioInput(profile.bio || "");
    setAvatarPreview(profile.avatar_url || "/default-avatar.png");
  }, [profile]);

  // Load MyGames data for stats and sections
  useEffect(() => {
    async function loadGames() {
      if (!user) {
        setMyGames([]);
        setLoadingGames(false);
        return;
      }

      try {
        setLoadingGames(true);
        const data = await getMyGamesByUser(user.id);
        setMyGames(data || []);
      } catch (err) {
        console.error("[ProfilePage] Error loading my_games:", err);
      } finally {
        setLoadingGames(false);
      }
    }

    loadGames();

    function onUpdated() {
      loadGames();
    }
    window.addEventListener("mygames:updated", onUpdated);
    return () => window.removeEventListener("mygames:updated", onUpdated);
  }, [user]);

  const displayName = (profile && profile.display_name) || "Guest Player";
  const avatar =
    avatarPreview || (profile && profile.avatar_url) || "/default-avatar.png";

  // Stats derived from myGames
  const { wishlistCount, playingCount, completedCount, recentlyPlayed } = useMemo(() => {
    const valid = (myGames || []).filter((g) => g.games);

    const wishlistCount = valid.filter((g) => g.status === "wishlist").length;
    const playingCount = valid.filter((g) => g.status === "playing").length;
    const completedCount = valid.filter((g) => g.status === "completed").length;

    const sortedByAdded = [...valid].sort((a, b) => {
      const da = new Date(a.added_at || 0);
      const db = new Date(b.added_at || 0);
      return db - da;
    });

    const recentlyPlayed = sortedByAdded
      .filter((g) => g.status === "playing" || g.status === "completed")
      .slice(0, 3);

    return { wishlistCount, playingCount, completedCount, recentlyPlayed };
  }, [myGames]);

  async function handleProfileSave(e) {
    e.preventDefault();
    if (!user) return;

    try {
      setSavingProfile(true);
      setProfileMessage("");

      let avatarUrl = (profile && profile.avatar_url) || null;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(user.id, avatarFile);
      }

      await updateProfile(user.id, {
        displayName: displayNameInput || null,
        bio: bioInput || null,
        avatarUrl,
      });

      await refreshProfile(user.id);
      setProfileMessage("Profile updated successfully.");
      setAvatarFile(null);
    } catch (err) {
      console.error("[ProfilePage] Error saving profile:", err);
      setProfileMessage(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPasswordMessage("");

    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("Password confirmation does not match.");
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword(newPassword);
      setPasswordMessage("Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("[ProfilePage] Error changing password:", err);
      setPasswordMessage(err.message || "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  }

  function handleAvatarChange(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const selected = files[0];
    setAvatarFile(selected);
    const previewUrl = URL.createObjectURL(selected);
    setAvatarPreview(previewUrl);
  }

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
            <p className="profile-email">{(user && user.email) || "guest@example.com"}</p>

            <p className="profile-bio">
              {(profile && profile.bio) || "No bio yet. Update your profile to add more info."}
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="profile-stats">
          <div className="stat-box">
            <h3 className="stat-value">{wishlistCount}</h3>
            <p className="stat-label">Wishlist</p>
          </div>

          <div className="stat-box">
            <h3 className="stat-value">{playingCount}</h3>
            <p className="stat-label">Playing</p>
          </div>

          <div className="stat-box">
            <h3 className="stat-value">{completedCount}</h3>
            <p className="stat-label">Completed</p>
          </div>
        </div>

        {/* RECENTLY PLAYED */}
        <div className="section">
          <h3 className="section-title">Recently Played</h3>
          <div className="recent-grid">
            {!loadingGames && recentlyPlayed.length === 0 && (
              <p style={{ opacity: 0.7, fontSize: "14px" }}>No recently played games yet.</p>
            )}
            {recentlyPlayed.map((entry) => {
              return (
                <div className="recent-card" key={entry.id}>
                  <img
                    src={(entry.games && entry.games.cover_url) || "/GameFlow.png"}
                    alt={(entry.games && entry.games.title) || "Game cover"}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ACHIEVEMENTS (placeholder, optional to keep for now) */}
        <div className="section">
          <h3 className="section-title">Achievements</h3>

          <div className="achievements">
            <div className="badge ps-badge">🏆 Starter</div>
            <div className="badge ps-badge">🔥 10 Games Played</div>
            <div className="badge ps-badge">⭐ Collector</div>
          </div>
        </div>

        {/* SETTINGS / EDIT PROFILE */}
        <div className="section">
          <h3 className="section-title">Profile Settings</h3>

          <div className="settings-card ps-card">
            <form onSubmit={handleProfileSave} className="profile-form">
              <div className="profile-form-row">
                <label className="profile-label">Username</label>
                <input
                  type="text"
                  className="profile-input"
                  placeholder="Display name"
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                />
              </div>

              <div className="profile-form-row">
                <label className="profile-label">Bio</label>
                <textarea
                  className="profile-input"
                  rows={3}
                  placeholder="Tell something about yourself..."
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                />
              </div>

              <div className="profile-form-row">
                <label className="profile-label">Avatar</label>
                <div className="profile-avatar-upload">
                  <input
                    id="avatar-upload-input"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAvatarChange}
                  />
                  <button
                    type="button"
                    className="profile-upload-btn"
                    onClick={() => {
                      const input = document.getElementById("avatar-upload-input");
                      if (input) {
                        input.click();
                      }
                    }}
                  >
                    Choose Image
                  </button>
                  <span className="profile-upload-hint">
                    {avatarFile ? avatarFile.name : "PNG, JPG up to a few MB"}
                  </span>
                </div>
              </div>

              {profileMessage && (
                <p className="profile-message">
                  {profileMessage}
                </p>
              )}

              <button className="profile-save-btn" type="submit" disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </form>

            <form onSubmit={handlePasswordChange} className="profile-form" style={{ marginTop: "24px" }}>
              <div className="profile-form-row">
                <label className="profile-label">New Password</label>
                <input
                  type="password"
                  className="profile-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="profile-form-row">
                <label className="profile-label">Confirm Password</label>
                <input
                  type="password"
                  className="profile-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {passwordMessage && (
                <p className="profile-message">
                  {passwordMessage}
                </p>
              )}

              <button className="profile-save-btn" type="submit" disabled={changingPassword}>
                {changingPassword ? "Updating..." : "Change Password"}
              </button>
            </form>

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
