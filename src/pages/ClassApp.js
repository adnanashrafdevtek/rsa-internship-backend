import React from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

// Dummy class list (can be stored in localStorage if needed)
const dummyClasses = [
  {
    name: "Math A",
    section: "1A",
    subject: "Math",
    room: "201",
    timings: "8:00 – 8:45 AM",
    teacher: "teacher",
  },
  {
    name: "Science B",
    section: "2B",
    subject: "Science",
    room: "102",
    timings: "9:00 – 9:45 AM",
    teacher: "teacher",
  },
  {
    name: "History C",
    section: "3C",
    subject: "History",
    room: "301",
    timings: "10:00 – 10:45 AM",
    teacher: "teacher2",
  },
];

export default function ClassApp() {
  const { user } = useAuth();

  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";

  const filteredClasses = isAdmin
    ? dummyClasses
    : isTeacher
    ? dummyClasses.filter((cls) => cls.teacher === user.username)
    : [];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "40px" }}>
        <h1>{isAdmin ? "All Classes" : isTeacher ? "Your Classes" : "Classes"}</h1>

        {filteredClasses.length === 0 ? (
          <p style={{ marginTop: "20px" }}>
            {isTeacher
              ? "You are not assigned to any classes."
              : "This page is only for teachers or admins."}
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
            <thead>
              <tr style={{ backgroundColor: "#eee" }}>
                <th style={thStyle}>Class Name</th>
                <th style={thStyle}>Section</th>
                <th style={thStyle}>Subject</th>
                <th style={thStyle}>Room</th>
                <th style={thStyle}>Timings</th>
                {isAdmin && <th style={thStyle}>Teacher</th>}
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((cls, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #ccc" }}>
                  <td style={tdStyle}>{cls.name}</td>
                  <td style={tdStyle}>{cls.section}</td>
                  <td style={tdStyle}>{cls.subject}</td>
                  <td style={tdStyle}>{cls.room}</td>
                  <td style={tdStyle}>{cls.timings}</td>
                  {isAdmin && <td style={tdStyle}>{capitalize(cls.teacher)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "10px",
  fontWeight: "bold",
};

const tdStyle = {
  padding: "10px",
};
