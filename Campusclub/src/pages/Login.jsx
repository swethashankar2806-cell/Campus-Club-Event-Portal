import { useState } from "react";
import Logo from "../assets/logo.jpeg";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email !== "" && password !== "") {
      onLogin();
    } else {
      alert("Please enter email and password");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">

        <img src={Logo} alt="Campus Club" className="img" />

        <h1>Campus Club</h1>

        <p>Campus Club & Event Management Portal</p>

        <form onSubmit={handleSubmit}>

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

          <button type="submit">Login</button>

        </form>
      </div>
    </div>
  );
}

export default Login;