import { supabase } from "../config/supabaseClient";

const AVATAR_BUCKET = "avatars"; // Pastikan bucket ini dibuat di Supabase Storage

export async function updateProfile(userId, { displayName, bio, avatarUrl }) {
  if (!userId) throw new Error("Missing userId for updateProfile");

  const updates = {
    display_name: displayName,
    bio,
  };

  if (avatarUrl) {
    updates.avatar_url = avatarUrl;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select();

  if (error) {
    console.error("[ProfileService.updateProfile] Error:", error);
    throw error;
  }

  // Return first updated row or null if none found
  return data && data.length > 0 ? data[0] : null;
}

export async function uploadAvatar(userId, file) {
  if (!userId) throw new Error("Missing userId for uploadAvatar");
  if (!file) throw new Error("No file provided for avatar upload");

  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    console.error("[ProfileService.uploadAvatar] Upload error:", uploadError);
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);

  return publicUrl;
}

export async function changePassword(newPassword) {
  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("[ProfileService.changePassword] Error:", error);
    throw error;
  }

  return data;
}


