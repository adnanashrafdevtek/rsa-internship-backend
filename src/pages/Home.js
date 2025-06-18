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
      <div
        style={{
          flex: 1,
          backgroundColor: "white",
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "10px" }}>
          Welcome, <span style={{ color: "#26bedd" }}>{user?.username}</span>
        </h1>

        {user?.username === "admin" && (
          <p style={{ fontSize: "18px", color: "#8e44ad", marginBottom: "20px" }}>
            You are logged in as an <strong>administrator</strong>.
          </p>
        )}

        <p style={{ fontSize: "18px", color: "#555" }}>
          This is the main content area of the home page. Here you can place any
          introductory information or features you want users to see first.
        </p>
      </div>
    </div>
  );
}
