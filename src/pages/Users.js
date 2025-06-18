import React from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar"; // adjust if your Sidebar is in components

// Dummy user list (can be replaced with real data)
const users = [
  { name: "Alice Thompson", role: "student" },
  { name: "Brian Wilson", role: "student" },
  { name: "Catherine Lee", role: "student" },
  { name: "Daniel Kim", role: "student" },
  { name: "Emily Davis", role: "student" },
  { name: "Frank Wright", role: "student" },
  { name: "Grace Parker", role: "student" },
  { name: "Henry Martinez", role: "student" },
  { name: "Isabella Clark", role: "student" },
  { name: "Jack Nguyen", role: "student" },
  { name: "teacher", role: "teacher" },
  { name: "admin", role: "admin" },
];

export default function Users() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return <p style={{ padding: "40px" }}>Unauthorized. Admins only.</p>;
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "40px" }}>
        <h1>All Users</h1>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr style={{ backgroundColor: "#eee" }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #ccc" }}>
                <td style={tdStyle}>{u.name}</td>
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
};

const tdStyle = {
  padding: "10px",
};
