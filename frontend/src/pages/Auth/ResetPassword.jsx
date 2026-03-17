import React, { useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

/* Right panel only */
const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email    = location.state?.email || '';

  const [otpValues, setOtpValues] = useState(['','','','','','']);
  const inputRefs  = useRef([]);
  const [formData, setFormData]   = useState({ newPassword:'', confirmPassword:'' });
  const [showPwd,  setShowPwd]    = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState('');
  const [success,  setSuccess]    = useState('');

  const handleInputChange = e =>
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleOtpChange = (idx, val) => {
    if (val && !/^[0-9]+$/.test(val)) return;
    const next = [...otpValues]; next[idx] = val.slice(-1); setOtpValues(next);
    if (val && idx < 5) inputRefs.current[idx+1]?.focus();
  };
  const handleOtpKeyDown = (idx, e) => {
    if (e.key==='Backspace' && !otpValues[idx] && idx>0) inputRefs.current[idx-1]?.focus();
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').slice(0,6).replace(/[^0-9]/g,'');
    if (!data) return;
    const next = [...otpValues];
    for (let i=0;i<data.length;i++) next[i]=data[i];
    setOtpValues(next);
    inputRefs.current[Math.min(data.length,5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!email)              { setError('Session expired. Please restart the process.'); return; }
    if (otpValues.join('').length !== 6) { setError('Enter all 6 digits.'); return; }
    if (!formData.newPassword)           { setError('Enter a new password.'); return; }
    if (formData.newPassword !== formData.confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await axios.post('/api/v1/users/reset-password', { email, otp: otpValues.join(''), newPassword: formData.newPassword });
      setSuccess('Password reset successfully!');
      setTimeout(() => navigate('/login', { state:{ message:'Password reset. Please login with your new password.' } }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP or failed to reset password.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="form-title">Reset Password</div>
      <div className="form-sub">Enter your verification code and choose a new password.</div>

      {error   && <div className="auth-sys-banner sys-error">{error}</div>}
      {success && <div className="auth-sys-banner sys-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label className="auth-label">Verification Code</label>
          <div className="otp-wrapper">
            {otpValues.map((d, i) => (
              <input key={i} ref={el => inputRefs.current[i]=el}
                type="text" inputMode="numeric" className="otp-input"
                value={d}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                onPaste={handlePaste}
              />
            ))}
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="newPassword">New Password</label>
          <div className="auth-input-wrap">
            <input id="newPassword" name="newPassword" type={showPwd ? 'text' : 'password'}
              className="auth-input" placeholder="At least 8 characters"
              value={formData.newPassword} onChange={handleInputChange}/>
            <button type="button" className="auth-eye-btn" onClick={() => setShowPwd(p => !p)}>
              {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="confirmPassword">Confirm Password</label>
          <div className="auth-input-wrap">
            <input id="confirmPassword" name="confirmPassword" type={showConf ? 'text' : 'password'}
              className="auth-input" placeholder="Repeat new password"
              value={formData.confirmPassword} onChange={handleInputChange}/>
            <button type="button" className="auth-eye-btn" onClick={() => setShowConf(p => !p)}>
              {showConf ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? 'Resetting…' : 'Set New Password'}
        </button>
      </form>

      <div className="auth-footer-links">
        <Link to="/forgot-password">← Request a new code</Link>
      </div>
    </>
  );
};

export default ResetPassword;