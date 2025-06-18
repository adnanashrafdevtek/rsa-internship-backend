import React from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";


const classData = [
  {
    subject: "Math",
    teacher: "teacher",
    students: ["Fatima Ahmed", "Zayd Ali"],
  },
  {
    subject: "Science",
    teacher: "teacher",
    students: ["Maryam Yusuf", "Bilal Rahman"],
  },
  {
    subject: "Quran",
    teacher: "ustadh",
    students: ["All students"],
  },
];

export default function ClassRosters() {
  const { user } = useAuth();

  const visibleClasses =
    user?.role === "admin"
      ? classData
      : classData.filter((cls) => cls.teacher === user?.username);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ padding: "30px", flex: 1 }}>
        <h1 style={{ marginBottom: "20px" }}>
          {user?.role === "admin" ? "All Class Rosters" : "Your Class Rosters"}
        </h1>

        {visibleClasses.length === 0 ? (
          <p>You don’t have any assigned classes.</p>
        ) : (
          visibleClasses.map((cls, index) => (
            <div
              key={index}
              style={{
                background: "#f9f9f9",
                padding: "16px",
                marginBottom: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <h2>{cls.subject}</h2>
              <p style={{ color: "#888" }}>Teacher: {cls.teacher}</p>
              <ul>
                {cls.students.map((student, i) => (
                  <li key={i}>{student}</li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
