import React from "react";
import "../styles/Profile.css";

function Profile() {
  const student = {
    name: localStorage.getItem("student_name") || "Student Name",
    department:
      localStorage.getItem("student_department") ||
      "Information Technology",
    role: "Student",
  };

  const initials = student.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      <div className="profile-card">
        <div className="profile-avatar">
          {initials || "S"}
        </div>

        <h2>{student.name}</h2>
        <p>
          <strong>Department:</strong> {student.department}
        </p>
        <p>
          <strong>Role:</strong> {student.role}
        </p>

        <button
          className="profile-button"
          onClick={() => alert(`Welcome, ${student.name}!`)}
        >
          View Profile
        </button>
      </div>
    </div>
  );
}

export default Profile;