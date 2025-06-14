import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div
      style={{
        width: "250px",
        backgroundColor: "#2c3e50",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        height: "100vh" // ensures sidebar fills full height
      }}
    >
      <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        Navigation
      </h2>

      {/* Navigation Links */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <a href="/home" style={linkStyle}>Home</a>
        <a href="/class" style={linkStyle}>Classes</a>
        <a href="/time" style={linkStyle}>Time</a>
        <a href="/student" style={linkStyle}>Student</a>
      </nav>

      {/* Spacer to push logout to bottom */}
      <div style={{ flexGrow: 1 }}></div>

      {/* Logout Button */}
      <button onClick={handleLogout} style={logoutStyle}>
        Logout
      </button>
    </div>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  padding: "10px",
  borderRadius: "4px",
  backgroundColor: "#34495e"
};

const logoutStyle = {
  padding: "10px",
  backgroundColor: "#e74c3c",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer"
};