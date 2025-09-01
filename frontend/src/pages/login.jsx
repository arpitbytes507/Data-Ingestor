// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../supaBase/supaBaseclient";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthRedirect = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("OAuth redirect error:", error.message);
        return;
      }

      if (data?.session?.user) {
        const user = data.session.user;

        // Check if username exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        if (!profile?.username) {
          const newUsername = prompt("Choose a username:");
          if (newUsername) {
            await supabase.from("profiles").upsert({
              id: user.id,
              username: newUsername,
              email: user.email,
            });
          }
        }

        // Clear the hash in the URL
        window.history.replaceState({}, document.title, "/login");

        // Redirect after login
        navigate("/ingest");
      }
    };

    handleOAuthRedirect();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Check profile for username
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", data.user.id)
        .single();

      if (!profile?.username) {
        const newUsername = prompt("Choose a username:");
        if (newUsername) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            username: newUsername,
            email: data.user.email,
          });
        }
      }

      navigate("/ingest");
    }

    setLoading(false);
  };

  const handlePasswordReset = async () => {
    const emailInput = prompt("Enter your email for password reset:");
    if (emailInput) {
      const { error } = await supabase.auth.resetPasswordForEmail(emailInput, {
        redirectTo: "http://localhost:5173/reset-password",
      });
      if (error) alert("❌ " + error.message);
      else alert("✅ Password reset email sent!");
    }
  };

  return (
    <AuthLayout>
      <div>
        <h2 className="text-3xl font-bold mb-6 text-center">Welcome Back 👋</h2>

        {error && <p className="text-red-300 mb-3 text-center">{error}</p>}

        {/* Email / Password login */}
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-white/10 border border-white/30 placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-white/10 border border-white/30 placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-purple-700 font-bold py-2 rounded-lg shadow hover:bg-yellow-300 active:scale-95 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-white/20"></div>
          <span className="mx-3 text-sm text-gray-300">OR</span>
          <div className="flex-grow border-t border-white/20"></div>
        </div>

        {/* OAuth buttons */}
        <div className="space-y-2">
          <button
            onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
          >
            Continue with Google
          </button>

          <button
            onClick={() => supabase.auth.signInWithOAuth({ provider: "github" })}
            className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition"
          >
            Continue with GitHub
          </button>
        </div>

        {/* Links */}
        <p className="mt-6 text-sm text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-yellow-300 hover:underline">
            Sign Up
          </Link>
        </p>
        <p
          onClick={handlePasswordReset}
          className="mt-3 text-sm text-yellow-300 text-center cursor-pointer hover:underline"
        >
          Forgot your password?
        </p>
      </div>
    </AuthLayout>
  );
}
