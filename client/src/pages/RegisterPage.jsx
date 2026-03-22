import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { FaGoogle } from 'react-icons/fa';
import InputField from '../components/InputField';
import { register, googleLogin as googleLoginApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = ({ target: { name, value } }) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await register(formData);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async ({ access_token }) => {
      try {
        const { data } = await googleLoginApi({ access_token });
        login(data.token, data.user);
        navigate('/dashboard');
      } catch {
        setError('Google sign-up failed');
      }
    },
    onError: () => setError('Google sign-up failed'),
    scope: 'openid email profile',
    ux_mode: 'popup',
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-text">HabiNest</div>
          <div className="auth-logo-sub">Build habits. Track progress.</div>
        </div>

        <h2 className="auth-title">Create an account</h2>
        <p className="auth-subtitle">
          Already have an account? <Link to="/login">Login</Link>
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <InputField label="Username" name="username" type="text" value={formData.username} onChange={handleChange} />
          <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
          <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit-btn">Create Account</button>
        </form>

        <div className="auth-divider">or</div>

        <button onClick={() => googleLogin()} className="auth-google-btn">
          <FaGoogle size={16} />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;