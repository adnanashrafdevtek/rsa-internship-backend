import React from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

// Dummy user list
const users = [
  { username: "admin", role: "admin" },
  { username: "teacher", role: "teacher" },
  { username: "teacher2", role: "teacher" },
  { username: "student", role: "student" },
  { username: "Fatima Ahmed", role: "student" },
  { username: "Zayd Ali", role: "student" },
  { username: "Bilal Rahman", role: "student" },
];

export default function Users() {
  const { user } = useAuth();

  const capitalizeFirst = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  if (user?.role !== "admin") {
    return <p style={{ padding: "40px" }}>Unauthorized. Admins only.</p>;
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "40px" }}>
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
            {users.map((u, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #ccc" }}>
                <td style={tdStyle}>{capitalizeFirst(u.username)}</td>
                <td style={tdStyle}>{capitalizeFirst(u.role)}</td>
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
};

const tdStyle = {
  padding: "10px",
};
