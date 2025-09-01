// src/pages/AuthCallback.jsx
import React from "react";
import { useEffect } from "react";
import { supabase } from "../../supaBase/supaBaseclient";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleRedirect() {
      const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
      if (error) {
        console.error("Auth callback error:", error.message);
        navigate("/login"); // redirect on failure
      } else {
        navigate("/"); // redirect after successful login
      }
    }

    handleRedirect();
  }, []);

  return <p>Logging you in…</p>;
}
