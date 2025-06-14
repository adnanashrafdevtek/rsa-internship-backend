import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Schedule() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Dummy schedule data
  const schedule = [
    { day: "Monday", time: "9:00 AM - 10:30 AM", subject: "Math" },
    { day: "Tuesday", time: "11:00 AM - 12:30 PM", subject: "Science" },
    { day: "Wednesday", time: "2:00 PM - 3:30 PM", subject: "History" },
    { day: "Thursday", time: "9:00 AM - 10:30 AM", subject: "English" },
    { day: "Friday", time: "1:00 PM - 2:30 PM", subject: "Art" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar onLogout={handleLogout} />

      <div style={{ flex: 1, backgroundColor: "white", padding: "40px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "20px" }}>
          {user?.username}'s Schedule
        </h1>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2", textAlign: "left" }}>
              <th style={cellStyle}>Day</th>
              <th style={cellStyle}>Time</th>
              <th style={cellStyle}>Subject</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((entry, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={cellStyle}>{entry.day}</td>
                <td style={cellStyle}>{entry.time}</td>
                <td style={cellStyle}>{entry.subject}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const cellStyle = {
  padding: "12px 15px",
  fontSize: "16px"
};