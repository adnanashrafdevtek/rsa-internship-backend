import React from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

export default function Users() {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Unauthorized</h2>
        <p>You do not have access to view this page.</p>
      </div>
    );
  }

  const users = [
    { username: "admin", role: "admin" },
    { username: "teacher", role: "teacher" },
    { username: "ustadh", role: "teacher" },
    { username: "student", role: "student" },
    { username: "Fatima Ahmed", role: "student" },
    { username: "Zayd Ali", role: "student" },
    { username: "Maryam Yusuf", role: "student" },
    { username: "Bilal Rahman", role: "student" },
    { username: "Layla Hussein", role: "student" },
    { username: "Sara Iqbal", role: "student" },
    { username: "Imran Saeed", role: "student" },
    { username: "Noor Zaman", role: "student" },
    { username: "Khalid Rafi", role: "student" },
    { username: "Mina Javed", role: "student" },
    { username: "Rami Dabbas", role: "student" },
    { username: "Yusuf Qureshi", role: "student" },
    { username: "Amina Malik", role: "student" },
    { username: "Tariq Nassar", role: "student" },
    { username: "Huda Fadl", role: "student" },
    { username: "Omar Khalil", role: "student" },
    { username: "Sana Mirza", role: "student" },
    { username: "Nabil Hossain", role: "student" },
    { username: "Bushra Kamal", role: "student" },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ padding: "40px", flex: 1 }}>
        <h1>All Users</h1>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#eee" }}>
              <th style={thStyle}>Username</th>
              <th style={thStyle}>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i}>
                <td style={tdStyle}>{u.username}</td>
                <td style={tdStyle}>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "10px",
  fontWeight: "bold",
  borderBottom: "1px solid #ccc",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee",
};
