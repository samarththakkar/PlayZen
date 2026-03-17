import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

/* Right panel only — layout & left panel live in AuthLayout */
const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();
  const messageFromState = location.state?.message || '';

  const [formData,     setFormData]     = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [isShaking,    setIsShaking]    = useState(false);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleInputChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.identifier || !formData.password) {
      setError('Please fill in all fields.');
      triggerShake();
      return;
    }
    setLoading(true);
    try {
      const isEmail = formData.identifier.includes('@');
      const payload = { password: formData.password };
      if (isEmail) payload.email    = formData.identifier;
      else         payload.username = formData.identifier;
      await login(payload);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="form-title">Welcome Back</div>
      <div className="form-sub">Sign in to continue to your workspace.</div>

      {messageFromState && <div className="auth-sys-banner sys-success">{messageFromState}</div>}
      {error            && <div className="auth-sys-banner sys-error">{error}</div>}

      <button
        type="button" className="auth-social-btn"
        onClick={() => window.location.href = 'http://localhost:8000/api/v1/users/auth/google'}
      >
        <svg className="social-icon" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <div className="auth-divider">
        <div className="auth-dline"></div>
        <div className="auth-dor">or sign in with email</div>
        <div className="auth-dline"></div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label className="auth-label" htmlFor="identifier">Email or Username</label>
          <input
            id="identifier" name="identifier" type="text"
            className="auth-input" placeholder="you@example.com"
            value={formData.identifier} onChange={handleInputChange}
          />
        </div>

        <div className="auth-field">
          <div className="auth-field-row">
            <label className="auth-label" htmlFor="password">Password</label>
            <Link to="/forgot-password" className="auth-forgot">Forgot password?</Link>
          </div>
          <div className="auth-input-wrap">
            <input
              id="password" name="password"
              type={showPassword ? 'text' : 'password'}
              className="auth-input" placeholder="Enter your password"
              value={formData.password} onChange={handleInputChange}
            />
            <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(p => !p)}>
              {showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          </div>
        </div>

        <div className="auth-terms">
          <input type="checkbox" id="rem"/>
          <label htmlFor="rem">Remember me</label>
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? 'Logging in…' : 'Sign In'}
        </button>
      </form>

      <div className="auth-footer-links">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </div>
    </>
  );
};

export default Login;