import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { FaGoogle } from 'react-icons/fa';
import InputField from '../components/InputField';
import { login as loginApi, googleLogin as googleLoginApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = ({ target: { name, value } }) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await loginApi(formData);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Please check your credentials.');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async ({ access_token }) => {
      try {
        const { data } = await googleLoginApi({ access_token });
        login(data.token, data.user);
        navigate('/dashboard');
      } catch {
        setError('Google login failed');
      }
    },
    onError: () => setError('Google login failed'),
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

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>

        <form onSubmit={handleLogin} className="auth-form">
          <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
          <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit-btn">Login</button>
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

export default Login;