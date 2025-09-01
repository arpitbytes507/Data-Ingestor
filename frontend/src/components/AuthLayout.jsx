import React from "react";
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center 
      bg-gradient-to-br from-blue-700 via-purple-700 to-pink-700 px-4">
      {children}
    </div>
  );
}
