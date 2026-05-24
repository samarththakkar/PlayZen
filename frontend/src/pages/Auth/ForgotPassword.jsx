import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from '../../utils/toast';

/* Right panel only */
const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/users/forgot-password', { email });
      toast.success('Reset code has been sent to your email.');
      setTimeout(() => navigate('/reset-password', { state: { email } }), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="form-title">Forgot Password?</div>
      <div className="form-sub">Enter your email and we'll send you a reset code.</div>

      <form onSubmit={handleSubmit} autoComplete="on">
        <div className="auth-field">
          <label className="auth-label" htmlFor="fp-email">Email Address</label>
          <input
            id="fp-email" type="email" autoComplete="email" className="auth-input"
            placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)}
          />
        </div>
        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? 'Sending…' : 'Send Reset Code'}
        </button>
      </form>

      <div className="auth-footer-links">
        <Link to="/login">← Back to Login</Link>
      </div>
    </>
  );
};

export default ForgotPassword;