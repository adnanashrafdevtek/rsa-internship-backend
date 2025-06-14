import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function ClassApp() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Dummy class data
  const classes = [
    { id: 1, name: "Math 101", teacher: "Mr. Smith", time: "9:00 AM - 10:00 AM" },
    { id: 2, name: "English Literature", teacher: "Ms. Johnson", time: "10:15 AM - 11:15 AM" },
    { id: 3, name: "Physics", teacher: "Dr. Brown", time: "11:30 AM - 12:30 PM" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div style={{ flex: 1, backgroundColor: "white", padding: "40px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "20px" }}>
          Welcome, {user?.username}, to the class app
        </h1>
        <p style={{ fontSize: "18px", color: "#555", marginBottom: "30px" }}>
          You can find your class schedule below:
        </p>

        {/* Display Classes */}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {classes.map((cls) => (
            <li
              key={cls.id}
              style={{
                backgroundColor: "#ecf0f1",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              <strong>{cls.name}</strong> <br />
              Teacher: {cls.teacher} <br />
              Time: {cls.time}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}