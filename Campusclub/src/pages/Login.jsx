import { useState } from "react";
import Logo from "../assets/logo.jpg";
import "../styles/Login.css";
function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (username !== "" && email !== "" && password !== "") {
      onLogin();
    } else {
      alert("Please fill all the fields");
    }
  };
  return (
    <div className="login-container">
      <div className="login-box">
        <img
          src={Logo}
          alt="Campus Club"
          className="login-logo"
        />
        <h1>Campus Club</h1>
        <p className="login-subtitle">
          Campus Club & Event Management Portal
        </p>
        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
export default Login;