import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail } from 'lucide-react';
import './Signup.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/v1/users/forgot-password', { email });
      setSuccess('If the email is registered, we have sent a reset OTP. Please check your inbox.');
      
      // Navigate to Reset Password page after short delay with email
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(212, 212, 212, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--accent-color)' }}>
              <Mail size={32} />
            </div>
          </div>
          <h1 className="auth-title">Forgot Password?</h1>
          <p className="auth-subtitle">No worries, we'll send you reset instructions.</p>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}
        {success && <div className="auth-success-banner">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label className="auth-label" htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email" 
              className="auth-input" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading} style={{ marginTop: '0.75rem' }}>
            {loading ? 'Sending...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
          <p className="auth-footer-text">
            <Link to="/login" className="auth-link">← Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
