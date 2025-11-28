// src/pages/ProfilePage.jsx
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);

  return (
    <div className="profile-container">
      <h2>My Profile</h2>

      {profile && (
        <div className="profile-box">
          <img src={profile.avatar_url} className="profile-avatar" />
          <h3>{profile.display_name}</h3>
          <p>{profile.bio || "No bio yet."}</p>
        </div>
      )}
    </div>
  );
}
