import { useState } from 'react';
function Register() {
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const handleRegister = (e) => {
e.preventDefault();
alert(`Registration successful! Welcome, ${name}`);
};
return ( <div className="register-container"> <h1>Student Registration</h1>
  <form onSubmit={handleRegister}>
    <input
      type="text"
      placeholder="Enter your name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      required
    />
    <input
      type="email"
      placeholder="Enter your email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
    <button type="submit">Register</button>
  </form>
</div>

);
}
export default Register;
