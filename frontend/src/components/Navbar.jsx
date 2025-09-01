// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supaBase/supaBaseclient";
import { useState,useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [user,setUser] = useState(null);

   useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();  
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (

    <nav className="bg-purple-800 text-white px-6 py-3 flex justify-between items-center shadow-md">
      <div className="flex space-x-6">
        <h1 className="text-2xl font-bold">📂 Data Ingestor</h1>
        <Link to="/ingest" className="hover:text-yellow-300">Ingest</Link>
        <Link to="/profile" className="hover:text-yellow-300">Profile</Link>
      </div>
       <div className="flex items-center space-x-4">
        {user && (
          <span className="text-sm text-yellow-300">
            Hi, {user.user_metadata?.username || user.email} 👋
          </span>
        )}
        <button
          onClick={handleLogout}
          className="bg-yellow-400 text-purple-800 px-4 py-1 rounded-lg hover:bg-yellow-300 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
