import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

/* Right panel only */
const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try {
      await axios.post('/api/v1/users/forgot-password', { email });
      setSuccess('If that email is registered, a reset code has been sent.');
      setTimeout(() => navigate('/reset-password', { state: { email } }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="form-title">Forgot Password?</div>
      <div className="form-sub">Enter your email and we'll send you a reset code.</div>

      {error   && <div className="auth-sys-banner sys-error">{error}</div>}
      {success && <div className="auth-sys-banner sys-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label className="auth-label" htmlFor="fp-email">Email Address</label>
          <input
            id="fp-email" type="email" className="auth-input"
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