import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [stepOneData, setStepOneData] = useState({ fullName: '', email: '' });
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [stepThreeData, setStepThreeData] = useState({
    username: '',
    password: '',
    coverImage: null,
    avatar: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const inputRefs = useRef([]);
  const [strengthIdx, setStrengthIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (step !== 2) return;
    if (timeLeft <= 0) {
      setStep(1);
      setSuccess('');
      setOtpValues(['', '', '', '', '', '']);
      setError('OTP expired after 10 minutes. Please request a new code.');
      return;
    }
    const t = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(t);
  }, [step, timeLeft]);

  useEffect(() => {
    if (step !== 2 || resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(t);
  }, [step, resendCooldown]);

  const handleStepOneChange = (e) => {
    const { name, value } = e.target;
    setStepOneData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStepThreeChange = (e) => {
    const { name, value } = e.target;
    setStepThreeData((prev) => ({ ...prev, [name]: value }));
    if (name === 'password') {
      let s = 0;
      if (value.length >= 6) s = 1;
      if (value.length >= 8 && /[A-Z]/.test(value)) s = 2;
      if (value.length >= 10 && /[!@#$%^&*]/.test(value)) s = 3;
      setStrengthIdx(s);
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files?.[0]) return;
    setStepThreeData((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!stepOneData.fullName || !stepOneData.email) {
      setError('Full name and email are required.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/users/send-otp', stepOneData);
      setSuccess(`OTP sent to ${stepOneData.email}`);
      setTimeLeft(600);
      setResendCooldown(60);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (idx, val) => {
    if (val && !/^[0-9]+$/.test(val)) return;
    const next = [...otpValues];
    next[idx] = val.slice(-1);
    setOtpValues(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
    const composedOtp = next.join('');
    if (step === 2 && composedOtp.length === 6 && !loading) {
      verifyOtpCode(composedOtp);
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpValues[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').slice(0, 6).replace(/[^0-9]/g, '');
    if (!data) return;
    const next = [...otpValues];
    for (let i = 0; i < data.length; i++) next[i] = data[i];
    setOtpValues(next);
    inputRefs.current[Math.min(data.length, 5)]?.focus();
  };

  const verifyOtpCode = async (otp) => {
    setError('');
    setSuccess('');
    if (otp.length !== 6) {
      setError('Enter all 6 digits.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/users/verify-otp', { email: stepOneData.email, otp });
      setSuccess('Email verified. Complete your account details.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    const otp = otpValues.join('');
    await verifyOtpCode(otp);
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setSuccess('');
    try {
      await api.post('/users/send-otp', stepOneData);
      setSuccess('A new OTP was sent.');
      setOtpValues(['', '', '', '', '', '']);
      setResendCooldown(60);
      setTimeLeft(600);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend OTP.');
    }
  };

  const handleFinalRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!stepThreeData.username || !stepThreeData.password || !stepThreeData.avatar) {
      setError('Username, password, and avatar are required.');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('fullName', stepOneData.fullName);
      data.append('email', stepOneData.email);
      data.append('username', stepThreeData.username);
      data.append('password', stepThreeData.password);
      data.append('avatar', stepThreeData.avatar);
      if (stepThreeData.coverImage) {
        data.append('coverImage', stepThreeData.coverImage);
      }
      await register(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <>
      <div className="form-title">{step === 1 ? 'Create Account' : step === 2 ? 'Verify Email' : 'Complete Profile'}</div>
      <div className="form-sub">
        {step === 1
          ? 'Step 1 of 3: Enter your basic details to get an OTP.'
          : step === 2
            ? <span>Step 2 of 3: We sent a 6-digit code to <strong>{stepOneData.email}</strong>.</span>
            : 'Step 3 of 3: Choose account credentials and upload your profile media.'
        }
      </div>

      <div className="signup-stepper">Step {step} / 3</div>

      {error && <div className="auth-sys-banner sys-error">{error}</div>}
      {success && <div className="auth-sys-banner sys-success">{success}</div>}

      {step === 1 && (
        <>
          <button
            type="button"
            className="auth-social-btn"
            onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL}/users/auth/google`}
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
            <div className="auth-dor">or register with email</div>
            <div className="auth-dline"></div>
          </div>

          <form onSubmit={handleSendOtp} autoComplete="on">
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                autoComplete="name"
                className="auth-input"
                placeholder="John Doe"
                value={stepOneData.fullName}
                onChange={handleStepOneChange}
              />
            </div>
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                className="auth-input"
                placeholder="you@example.com"
                value={stepOneData.email}
                onChange={handleStepOneChange}
              />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Sending OTP…' : 'Send OTP'}
            </button>
          </form>

          <div className="auth-footer-links">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </>
      )}

      {step === 2 && (
        <form onSubmit={handleOtpVerify} autoComplete="one-time-code">
          <div className="otp-wrapper">
            {otpValues.map((d, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="otp-input"
                value={d}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                onPaste={handlePaste}
              />
            ))}
          </div>

          <div className="otp-timer">
            Time remaining:{' '}
            <span className={`otp-timer-value ${timeLeft <= 10 ? 'expiring' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading || timeLeft === 0}
          >
            {loading ? 'Verifying…' : 'Verify OTP'}
          </button>

          <div className="auth-footer-links signup-actions-row">
            <button type="button" className="link-btn" onClick={handleResendOtp} disabled={resendCooldown > 0}>
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
            </button>
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setStep(1);
                setOtpValues(['', '', '', '', '', '']);
                setError('');
                setSuccess('');
              }}
            >
              Edit email
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleFinalRegister} autoComplete="on">
          <div className="auth-field">
            <label className="auth-label">Username</label>
            <input
              type="text"
              name="username"
                autoComplete="username"
              className="auth-input"
              placeholder="johndoe123"
              value={stepThreeData.username}
              onChange={handleStepThreeChange}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                className="auth-input"
                placeholder="Create a secure password"
                value={stepThreeData.password}
                onChange={handleStepThreeChange}
              />
              <button type="button" className="auth-eye-btn" onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {stepThreeData.password && (
              <div className="strength-bar">
                <div className={`strength-seg ${strengthIdx >= 1 ? 's1' : ''}`}></div>
                <div className={`strength-seg ${strengthIdx >= 2 ? 's2' : ''}`}></div>
                <div className={`strength-seg ${strengthIdx >= 3 ? 's3' : ''}`}></div>
              </div>
            )}
          </div>

          <div className="auth-grid-2">
            <div className="auth-field">
              <label className="auth-label">Avatar (required)</label>
              <input type="file" name="avatar" className="auth-input auth-file-input" accept="image/*" onChange={handleFileChange} />
            </div>
            <div className="auth-field">
              <label className="auth-label">Cover Image (optional)</label>
              <input type="file" name="coverImage" className="auth-input auth-file-input" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
      )}
    </>
  );
};

export default Signup;