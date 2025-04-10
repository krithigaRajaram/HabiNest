import React, { useState } from 'react';
import axios from 'axios';
import InputField from '../components/InputField'; 
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    //console.log(name, value); 
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', formData);
      //console.log(response.data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard');
      }
    } catch (err) { 
      setError('Registration failed');
    }
  };
  

  return (
    <div className="auth-page">
      <h2>Register</h2>
      <form onSubmit={handleRegisterSubmit}>
        <InputField
          label="Username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
        />
        <InputField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
        />
        {error && <p>{error}</p>}
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;
