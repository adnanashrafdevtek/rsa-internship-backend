import React, { useState } from "react";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!/\d/.test(newPassword)) {
      setError("Password must include at least one number.");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setError("Password must include at least one special character.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setMessage("Your password has been reset successfully!");
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", textAlign: "center" }}>
      <h2>Reset Password</h2>
      {message ? (
        <p style={{ color: "green" }}>{message}</p>
      ) : (
        <form onSubmit={handleReset}>
          <div style={{ marginBottom: "10px" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            />
            <label style={{ fontSize: "14px", display: "flex", marginTop: "4px" }}>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />{" "}
              Show Password
            </label>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            />
            <label style={{ fontSize: "14px", display: "flex", marginTop: "4px"}}>
              <input
                type="checkbox"
                checked={showConfirmPassword}
                onChange={() => setShowConfirmPassword(!showConfirmPassword)}
              />{" "}
              Show Confirm Password
            </label>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="submit" style={{ padding: "8px 16px" }}>
            Reset Password
          </button>
        </form>
      )}
    </div>
  );
}

export default ResetPassword;