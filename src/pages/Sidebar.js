import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null; // hide sidebar if not logged in

  // Common links for all users
  const links = [
    { name: "Home", path: "/home" },
    { name: "Classes", path: "/class" },
    { name: "Schedule", path: "/schedule" },
  ];

  // Admin-only links
  if (user.role === "admin") {
    links.push({ name: "Users", path: "/student" });
  }

  return (
    <div
      style={{
        width: "250px",
        backgroundColor: "#2c3e50",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        height: "100vh"
      }}
    >
      <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        Navigation
      </h2>

      {/* Navigation Links */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {links.map((link) => (
          <a key={link.name} href={link.path} style={linkStyle}>
            {link.name}
          </a>
        ))}
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