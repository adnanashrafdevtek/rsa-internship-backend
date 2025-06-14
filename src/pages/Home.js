import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
          {/* Sidebar */}
          <Sidebar onLogout={handleLogout} />
    
          {/* Main Content */}
          <div style={{ flex: 1, backgroundColor: "white", padding: "40px" }}>

        
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, backgroundColor: "white", padding: "40px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "20px" }}>
          Welcome, {user?.username}
        </h1>
        <p style={{ fontSize: "18px", color: "#555" }}>
          This is the main content area of the home page. Here you can place any
          introductory information or content you'd like your visitors to see
          first.
        </p>
      </div>
    </div>
  );
}