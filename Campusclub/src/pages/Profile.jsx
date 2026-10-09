function Profile() {
return ( <div className="profile-container"> <h1>My Profile</h1>
  <div className="profile-card">
    <h2>Student Details</h2>
    <p><strong>Name:</strong> Student Name</p>
    <p><strong>Department:</strong> Information Technology</p>
    <p><strong>Role:</strong> Student</p>

    <button onClick={() => alert('Profile page opened!')}>
      View Profile
    </button>
  </div>
</div>

);
}

export default Profile;
