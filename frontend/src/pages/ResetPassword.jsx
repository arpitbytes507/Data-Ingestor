
import React, { useState } from "react";
import { supabase } from "../../supaBase/supaBaseclient";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) setError(error.message);
    else {
      alert("✅ Password updated successfully! Please log in.");
      navigate("/login");
    }
  };

  return (
    <AuthLayout>
      <div className="">
        <h2 className="text-3xl font-bold mb-6 text-center">Reset Password 🔒</h2>

        {error && <p className="text-red-300 mb-3 text-center">{error}</p>}

        <form onSubmit={handleReset} className="space-y-3">
          <input
            type="password"
            placeholder="New password"
            className="w-full p-3 rounded-lg bg-white/10 border border-white/30 placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full p-3 rounded-lg bg-white/10 border border-white/30 placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-purple-700 font-bold py-2 rounded-lg shadow hover:bg-yellow-300 active:scale-95 transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
