import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InputField from '../../components/InputField';
import ThemeToggle from '../../components/ThemeToggle';
import { BASE_URL } from '../../config';
import './Signup.css';

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  async function handleSignup(e) {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(`${BASE_URL}/api/Signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          username,
          password,
          firstName,
          lastName,
          email,
          phone,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        console.log("Signup successful:", data.username);
        alert('Account created! Please login.');
        navigate('/login');
      } else {
        console.error("Signup failed:", data.message);
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Network error:", error);
      setMessage('Something went wrong. Try again.');
    }
  }

  return (
    <>
      <ThemeToggle />
      <div className="page">
        <form className="card card--wide" onSubmit={handleSignup}>
          <h1>Admin Sign Up</h1>
          <p className="subtitle">Create your admin account</p>

          {message && <p className="error-msg">{message}</p>}

          <div className="grid">
            <InputField label="First Name" value={firstName} onChange={setFirstName} />
            <InputField label="Last Name" value={lastName} onChange={setLastName} />
            <InputField label="Email" type="email" value={email} onChange={setEmail} />
            <InputField label="Phone" type="tel" value={phone} onChange={setPhone} />
            <InputField label="Username" value={username} onChange={setUsername} />
            <InputField label="Password" type="password" value={password} onChange={setPassword} />
          </div>

          <button type="submit">Sign Up</button>

          <p className="toggle">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </>
  );
}

export default Signup;

