import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

const allStudents = [
  "Fatima Ahmed", "Zayd Ali", "Maryam Yusuf", "Bilal Rahman",
  "Layla Hussein", "Imran Saeed", "Noor Zaman", "Sara Iqbal",
  "Khalid Rafi", "Mina Javed", "Rami Dabbas", "Yusuf Qureshi",
  "Amina Malik", "Tariq Nassar", "Huda Fadl", "Omar Khalil",
  "Sana Mirza", "Nabil Hossain", "Bushra Kamal"
];

const defaultClassData = [
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
  const [classes, setClasses] = useState(defaultClassData);
  const [newStudents, setNewStudents] = useState({});

  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  const visibleClasses = classes.filter((cls) => {
    if (user?.role === "admin") return true;
    if (user?.role === "teacher") return cls.teacher === user.username;
    if (user?.role === "student") {
      const studentList = cls.students.includes("All students")
        ? allStudents
        : cls.students;
      return studentList.includes(user.username);
    }
    return false;
  });

  const handleAddStudent = (index) => {
    const name = newStudents[index]?.trim();
    if (!name) return;

    const updated = [...classes];
    if (!updated[index].students.includes(name)) {
      updated[index].students = updated[index].students.filter(s => s !== "All students");
      updated[index].students.push(name);
      setClasses(updated);
      setNewStudents({ ...newStudents, [index]: "" });
    }
  };

  const handleRemoveStudent = (classIndex, studentIndex) => {
    const updated = [...classes];
    updated[classIndex].students.splice(studentIndex, 1);
    setClasses(updated);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ padding: "30px", flex: 1 }}>
        <h1 style={{ marginBottom: "20px" }}>
          {user?.role === "admin"
            ? "All Class Rosters"
            : user?.role === "teacher"
            ? "Your Class Rosters"
            : "Class Rosters You're Enrolled In"}
        </h1>

        {visibleClasses.length === 0 ? (
          <p>You don’t have any assigned classes.</p>
        ) : (
          visibleClasses.map((cls, index) => {
            const studentList = cls.students.includes("All students")
              ? allStudents
              : cls.students;

            return (
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
                <p style={{ color: "#888" }}>
                  Teacher: {capitalize(cls.teacher)}
                </p>

                <ul style={{ paddingLeft: "20px" }}>
                  {studentList.map((student, i) => (
                    <li key={i} style={{ marginBottom: "4px" }}>
                      {student}{" "}
                      {(user?.role === "admin" || cls.teacher === user.username) && (
                        <button
                          onClick={() => handleRemoveStudent(index, i)}
                          style={{
                            marginLeft: "10px",
                            background: "#e74c3c",
                            color: "white",
                            border: "none",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </li>
                  ))}
                </ul>

                {(user?.role === "admin" || cls.teacher === user.username) && (
                  <div style={{ marginTop: "12px" }}>
                    <input
                      type="text"
                      placeholder="Add student"
                      value={newStudents[index] || ""}
                      onChange={(e) =>
                        setNewStudents({
                          ...newStudents,
                          [index]: e.target.value,
                        })
                      }
                      style={{
                        padding: "6px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        width: "60%",
                      }}
                    />
                    <button
                      onClick={() => handleAddStudent(index)}
                      style={{
                        marginLeft: "10px",
                        padding: "6px 10px",
                        backgroundColor: "#3498db",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
