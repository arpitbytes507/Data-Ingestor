// src/pages/Signup.jsx
import React, { useState } from "react";
import { supabase } from "../../supaBase/supaBaseclient";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ Proper destructuring
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password,
      }
    );

    if (signUpError) {
      setError(signUpError.message);
      console.error("Signup Error:", signUpError);
      return;
    }

    if (signUpData?.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: signUpData.user.id,
        username,
        email: signUpData.user.email,
      });

      if (profileError) {
        setError(profileError.message);
        return;
      }
    }

    navigate("/login");
  };

  return (
    <AuthLayout>
      <div className="bg-black/30 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md text-white">
        <h2 className="text-3xl font-bold mb-6 text-center">Create Account</h2>
        {error && <p className="text-red-300 mb-3">{error}</p>}

        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 mb-3 rounded-lg bg-white/10 border border-white/30 text-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-3 rounded-lg bg-white/10 border border-white/30 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-4 rounded-lg bg-white/10 border border-white/30 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-yellow-400 text-purple-700 font-bold py-2 rounded-lg"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-yellow-300 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
