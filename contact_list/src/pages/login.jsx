// src/pages/Login.js
import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';

import './Login.css'; // Make sure to replace 'Login.css' with your actual CSS file name

const Login = ({ authenticateUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [redirect, setRedirect] = useState(null);

  const handleLogin = async () => {
    try {
      const response = await axios.post('https://contactlist-1.onrender.com/api/login', {
        username,
        password,
      });
     
      if (response.data.success) {
        // Call the authentication function on successful login
        authenticateUser();
        // Set the redirect URL
        setRedirect(response.data.redirect);
      }
      
    } catch (error) {
      setError('Invalid credentials. Please try again.');
      console.error('Login error:', error.message);
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <label>
        Username:
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
        />
      </label>
      <br />
      <label>
        Password:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
      </label>
      <br />
      <button onClick={handleLogin} className="login-button">
        Login
      </button>
      {error && <p className="login-error">{error}</p>}
      <p className="login-signup-link">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
      {redirect && <Navigate to={redirect} />}
    </div>
  );
};

export default Login;
