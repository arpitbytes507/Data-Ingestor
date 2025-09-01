import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supaBase/supaBaseclient";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Ingest from "./pages/Ingest";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import Navbar from "./components/Navbar";


export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    getSession();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => listener.subscription.unsubscribe();
  }, []);
   if (loading) {
    return <p className="text-white text-center mt-10">Loading...</p>;
  } 

  return (
    <BrowserRouter>
        {!session ? (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        ) : (
          <>
            <Navbar/>
            <Routes>
              <Route path="/ingest" element={<Ingest />} />
              <Route path="/profile" element={<Profile/>}/>
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<Navigate to="/ingest" />} />
            </Routes>
          </>
        )}
    </BrowserRouter>
  );
}
