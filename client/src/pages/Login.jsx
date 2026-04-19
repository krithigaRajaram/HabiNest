import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { FaGoogle } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { Label }  from '@/components/ui/label';
import { login as loginApi, googleLogin as googleLoginApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleChange = ({ target: { name, value } }) =>
    setFormData((p) => ({ ...p, [name]: value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await loginApi(formData);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Please check your credentials.');
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
            {loading ? 'Logging in…' : 'Login'}
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

export default Login;