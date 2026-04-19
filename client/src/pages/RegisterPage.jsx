import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { FaGoogle } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { Label }  from '@/components/ui/label';
import { register, googleLogin as googleLoginApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleChange = ({ target: { name, value } }) =>
    setFormData((p) => ({ ...p, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await register(formData);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    } finally {
      setLoading(false);
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
          <div className="auth-field">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="yourname"
              required
            />
          </div>

          <div className="auth-field">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="auth-field">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <Button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <div className="auth-divider">or</div>

        <Button
          type="button"
          variant="outline"
          className="auth-google-btn"
          onClick={() => googleLogin()}
        >
          <FaGoogle size={14} />
          Continue with Google
        </Button>

      </div>
    </div>
  );
};

export default RegisterPage;