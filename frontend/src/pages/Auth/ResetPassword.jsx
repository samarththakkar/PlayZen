import React, { useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import './Signup.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^[0-9]+$/.test(value)) return;

    const newOtpValues = [...otpValues];
    // Keep only the last character entered
    newOtpValues[index] = value.substring(value.length - 1);
    setOtpValues(newOtpValues);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/[^0-9]/g, '');
    if (pastedData) {
      const newOtpValues = [...otpValues];
      for (let i = 0; i < pastedData.length; i++) {
        newOtpValues[i] = pastedData[i];
      }
      setOtpValues(newOtpValues);
      
      // Focus the next empty input or the last one
      const nextIndex = pastedData.length < 6 ? pastedData.length : 5;
      inputRefs.current[nextIndex].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Session expired. Please start the forgot password process again.');
      return;
    }

    const otpCode = otpValues.join('');
    
    if (otpCode.length !== 6) {
      setError('Please fill in all 6 digits of the OTP.');
      return;
    }

    if (!formData.newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/v1/users/reset-password', {
        email,
        otp: otpCode,
        newPassword: formData.newPassword,
      });

      setSuccess('Password reset successfully!');
      
      setTimeout(() => {
        navigate('/login', { state: { message: 'Password reset successfully. Please login with your new password.' } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP or failed to reset password.');
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
              <KeyRound size={32} />
            </div>
          </div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter the OTP sent to <strong>{email || 'your email'}</strong></p>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}
        {success && <div className="auth-success-banner">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group otp-inputs-wrapper" style={{ marginTop: '0', marginBottom: '0.5rem' }}>
            {otpValues.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                className="otp-box-input"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={handlePaste}
              />
            ))}
          </div>

          <div className="auth-input-group">
            <label className="auth-label" htmlFor="newPassword">New Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"} 
                className="auth-input" 
                style={{ paddingRight: '2.5rem' }}
                value={formData.newPassword}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="auth-input-group" style={{ marginTop: '0.25rem' }}>
            <label className="auth-label" htmlFor="confirmPassword">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"} 
                className="auth-input" 
                style={{ paddingRight: '2.5rem' }}
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading} style={{ marginTop: '0.75rem' }}>
            {loading ? 'Resetting...' : 'Set New Password'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
          <p className="auth-footer-text">
            <Link to="/forgot-password" className="auth-link">← Request a new code</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
