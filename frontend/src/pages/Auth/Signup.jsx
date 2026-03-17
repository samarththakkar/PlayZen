import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Eye, EyeOff, X, Camera } from 'lucide-react';
import './Signup.css';

/* Right panel only — layout & left panel live in AuthLayout */
const Signup = () => {
  const navigate = useNavigate();

  const [formData,     setFormData]     = useState({ fullName:'', email:'', username:'', password:'' });
  const [showPassword, setShowPassword] = useState(false);
  const [step,         setStep]         = useState(1);
  const [otpValues,    setOtpValues]    = useState(['','','','','','']);
  const inputRefs = useRef([]);
  const [success,      setSuccess]      = useState('');
  const [timeLeft,     setTimeLeft]     = useState(60);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [strengthIdx,  setStrengthIdx]  = useState(0);

  // Avatar / crop states
  const [avatar,        setAvatar]        = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [imageSrc,      setImageSrc]      = useState('');
  const [crop,          setCrop]          = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isCropping,    setIsCropping]    = useState(false);
  const imgRef = useRef(null);

  // OTP countdown — auto-expire
  useEffect(() => {
    if (step !== 2) return;
    if (timeLeft === 0) {
      setStep(1);
      setSuccess('');
      setError('OTP expired. Please try again.');
      setOtpValues(['','','','','','']);
      return;
    }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [step, timeLeft]);

  // ── INPUT HANDLERS ──
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') {
      let s = 0;
      if (value.length >= 4) s = 1;
      if (value.length >= 8 && /[A-Z]/.test(value)) s = 2;
      if (value.length >= 10 && /[!@#$%^&*]/.test(value)) s = 3;
      setStrengthIdx(s);
    }
  };

  // ── AVATAR / CROP HANDLERS ──
  const clearImage = () => {
    setAvatar(null); setAvatarPreview('');
    setImageSrc(''); setCrop(undefined); setCompletedCrop(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setIsCropping(true);
      });
      reader.readAsDataURL(e.target.files[0]);
      e.target.value = '';
    }
  };

  const onImageLoad = (e) => {
    if (!crop) setCrop({ unit:'%', width:80, height:80, x:10, y:10 });
  };

  const getCroppedImg = async (image, c) => {
    const canvas = document.createElement('canvas');
    const sx = image.naturalWidth  / image.width;
    const sy = image.naturalHeight / image.height;
    canvas.width  = c.width  * sx;
    canvas.height = c.height * sy;
    canvas.getContext('2d').drawImage(image, c.x*sx, c.y*sy, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    return new Promise(res => canvas.toBlob(res, 'image/jpeg'));
  };

  const showCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) return;
    try {
      const blob = await getCroppedImg(imgRef.current, completedCrop);
      setAvatar(new File([blob], 'avatar.jpg', { type:'image/jpeg' }));
      setAvatarPreview(URL.createObjectURL(blob));
      setIsCropping(false);
    } catch {
      setError('Error cropping image');
    }
  };

  // ── STEP 1: Send OTP ──
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.fullName || !formData.email || !formData.username || !formData.password) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/v1/users/send-otp', { email: formData.email, fullName: formData.fullName });
      setSuccess(`OTP sent to ${formData.email}`);
      setTimeLeft(60);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP INPUT HANDLERS ──
  const handleOtpChange = (idx, val) => {
    if (val && !/^[0-9]+$/.test(val)) return;
    const next = [...otpValues];
    next[idx] = val.slice(-1);
    setOtpValues(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
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

  // ── STEP 2: Verify OTP + Register ──
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const otp = otpValues.join('');
    if (otp.length !== 6) { setError('Enter all 6 digits.'); return; }
    setLoading(true);
    try {
      await axios.post('/api/v1/users/verify-otp', { email: formData.email, otp });
      setSuccess('Email verified! Finalizing…');
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      if (avatar) data.append('avatar', avatar);
      await axios.post('/api/v1/users/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/login', { state: { message: 'Registration successful. Please login!' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
      setLoading(false);
    }
  };

  // ── RENDER ──
  return (
    <>
      <div className="form-title">
        {step === 1 ? 'Create Account' : 'Verify Email'}
      </div>
      <div className="form-sub">
        {step === 1
          ? 'Join PlayZen and start creating today.'
          : <span>We sent a 6-digit code to <strong>{formData.email}</strong></span>
        }
      </div>

      {error   && <div className="auth-sys-banner sys-error">{error}</div>}
      {success && <div className="auth-sys-banner sys-success">{success}</div>}

      {/* ══ STEP 1 ══ */}
      {step === 1 && (
        <>
          {/* Google */}
          <button
            type="button"
            className="auth-social-btn"
            onClick={() => window.location.href = 'http://localhost:8000/api/v1/users/auth/google'}
          >
            <svg className="social-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>

          <div className="auth-divider">
            <div className="auth-dline"></div>
            <div className="auth-dor">or sign up with email</div>
            <div className="auth-dline"></div>
          </div>

          <form onSubmit={handleSignupSubmit} encType="multipart/form-data">

            {/* Name + Username */}
            <div className="auth-grid-2">
              <div className="auth-field">
                <label className="auth-label">Full Name</label>
                <input
                  type="text" name="fullName" className="auth-input"
                  placeholder="John Doe"
                  value={formData.fullName} onChange={handleInputChange}
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Username</label>
                <input
                  type="text" name="username" className="auth-input"
                  placeholder="johndoe123"
                  value={formData.username} onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <input
                type="email" name="email" className="auth-input"
                placeholder="you@example.com"
                value={formData.email} onChange={handleInputChange}
              />
            </div>

            {/* Password + strength */}
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Create a strong password"
                  value={formData.password} onChange={handleInputChange}
                />
                <button
                  type="button" className="auth-eye-btn"
                  onClick={() => setShowPassword(p => !p)}
                >
                  {showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              {formData.password && (
                <div className="strength-bar">
                  <div className={`strength-seg ${strengthIdx >= 1 ? 's1' : ''}`}></div>
                  <div className={`strength-seg ${strengthIdx >= 2 ? 's2' : ''}`}></div>
                  <div className={`strength-seg ${strengthIdx >= 3 ? 's3' : ''}`}></div>
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="auth-terms">
              <input type="checkbox" id="terms" required/>
              <label htmlFor="terms">
                I agree to the <Link to="#">Terms of Service</Link> and <Link to="#">Privacy Policy</Link>
              </label>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Processing…' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer-links">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </>
      )}

      {/* ══ STEP 2 — OTP ══ */}
      {step === 2 && (
        <form onSubmit={handleOtpSubmit}>
          <div className="otp-wrapper">
            {otpValues.map((d, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                className="otp-input"
                value={d}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                onPaste={handlePaste}
              />
            ))}
          </div>

          {/* Timer using Signup.css classes */}
          <div className="otp-timer">
            Time remaining:{' '}
            <span className={`otp-timer-value ${timeLeft <= 10 ? 'expiring' : ''}`}>
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </span>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading || timeLeft === 0}
          >
            {loading ? 'Verifying…' : 'Verify & Create Account'}
          </button>

          <div className="auth-footer-links" style={{ marginTop: '12px' }}>
            Wrong email?{' '}
            <Link
              to="#"
              onClick={e => {
                e.preventDefault();
                setStep(1);
                setSuccess('');
                setOtpValues(['','','','','','']);
                setError('');
              }}
            >
              Go back
            </Link>
          </div>
        </form>
      )}

      {/* ══ CROP MODAL ══ */}
      {isCropping && (
        <div className="crop-modal-overlay">
          <div className="crop-modal-content">
            <h3 style={{ margin:'0 0 1rem', color:'#fff', textAlign:'center', fontFamily:'Syne, sans-serif', fontSize:'16px', fontWeight:600 }}>
              Crop Your Image
            </h3>
            <div style={{ maxHeight:'60vh', overflow:'auto', display:'flex', justifyContent:'center', borderRadius:'10px', background:'#1a1a26' }}>
              <ReactCrop
                crop={crop}
                onChange={(_, p) => setCrop(p)}
                onComplete={c => setCompletedCrop(c)}
                circularCrop
                aspect={1}
                style={{ maxHeight:'60vh' }}
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  onLoad={onImageLoad}
                  alt="Crop preview"
                  style={{ maxHeight:'60vh', width:'auto' }}
                />
              </ReactCrop>
            </div>
            <div style={{ display:'flex', gap:'10px', marginTop:'1.25rem', justifyContent:'flex-end' }}>
              <button type="button" onClick={() => setIsCropping(false)} className="crop-btn secondary">
                Cancel
              </button>
              <button type="button" onClick={showCroppedImage} className="crop-btn primary">
                Crop & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Signup;