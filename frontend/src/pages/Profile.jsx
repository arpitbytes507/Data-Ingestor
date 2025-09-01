// src/pages/Profile.jsx
import React from "react";
import { useEffect, useState } from "react";
import { supabase } from "../../supaBase/supaBaseclient";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
  const getUserProfile = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setUsername(data.username || "");

        if (data.avatar_url) {
          const { data: signedUrlData } = await supabase.storage
            .from("avatars")
            .createSignedUrl(data.avatar_url, 3600); // 1 hour
          setAvatarUrl(signedUrlData?.signedUrl || "");
        }
      }
    }
    setLoading(false);
  };

  getUserProfile();
}, []);




  const handleSave = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ username, avatar_url: avatarUrl })
      .eq("id", user.id);

    if (error) {
      setMessage("❌ Error updating profile");
    } else {
      setMessage("✅ Profile updated!");
    }
  };

  const handleUploadAvatar = async (e) => {
  try {
    const file = e.target.files[0];
    if (!file || !user) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    // upload file
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // save only file path in DB
    const { error: dbError } = await supabase
      .from("profiles")
      .update({ avatar_url: filePath })
      .eq("id", user.id);

    if (dbError) throw dbError;

    // generate signed URL immediately for preview
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("avatars")
      .createSignedUrl(filePath, 3600);

    if (signedUrlError) throw signedUrlError;

    setAvatarUrl(signedUrlData.signedUrl);
    setMessage("✅ Avatar updated!");
  } catch (err) {
    console.error("Upload error:", err.message);
    setMessage("❌ Error uploading avatar");
  }
};




  if (loading) return <p className="text-center text-white">Loading...</p>;

  return (
    <div className="max-w-md mx-auto mt-10 bg-purple-900 text-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      <p className="mb-2">Email: {user?.email}</p>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-yellow-400"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-2">
            No Avatar
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleUploadAvatar}
          className="text-sm"
        />
      </div>

      {/* Username */}
      <label className="block mb-2">Username</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-2 mb-4 rounded bg-white/10 border border-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
      />

      <button
        onClick={handleSave}
        className="w-full bg-yellow-400 text-purple-800 font-bold py-2 rounded-lg hover:bg-yellow-300 transition"
      >
        Save Changes
      </button>

      {message && <p className="mt-3 text-center">{message}</p>}
    </div>
  );
}
