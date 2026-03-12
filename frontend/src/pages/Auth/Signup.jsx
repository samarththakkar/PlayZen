import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Eye, EyeOff, X, Camera } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    let timer;
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (step === 2 && timeLeft === 0) {
      // Auto-reset when timer expires
      setStep(1);
      setSuccess('');
      setError('OTP has expired. Please try signing up again.');
      setOtpValues(['', '', '', '', '', '']);
    }

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Final cropped blobs to upload
  const [avatar, setAvatar] = useState(null);
  
  // Preview URLs
  const [avatarPreview, setAvatarPreview] = useState('');

  // Cropping States
  const [imageSrc, setImageSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  
  const imgRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');

  // Simulate skeleton loading on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const clearImage = () => {
    setAvatar(null);
    setAvatarPreview('');
    setImageSrc('');
    setCrop(undefined);
    setCompletedCrop(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Reset crop state
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset input so same file can be selected again
    }
  };

  const onImageLoad = (e) => {
    // Only set default crop if none exists yet
    if (!crop) {
      setCrop({ unit: '%', width: 80, height: 80, x: 10, y: 10 });
    }
  };

  // Extract the cropped portion from the HTMLImageElement
  const getCroppedImg = async (image, cropConfig) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = cropConfig.width * scaleX;
    canvas.height = cropConfig.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(
      image,
      cropConfig.x * scaleX,
      cropConfig.y * scaleY,
      cropConfig.width * scaleX,
      cropConfig.height * scaleY,
      0,
      0,
      cropConfig.width * scaleX,
      cropConfig.height * scaleY
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const showCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) return;
    
    try {
      const croppedImageBlob = await getCroppedImg(
        imgRef.current,
        completedCrop
      );
      
      const fileUrl = URL.createObjectURL(croppedImageBlob);
      const fileToUpload = new File([croppedImageBlob], `avatar.jpg`, { type: 'image/jpeg' });

      setAvatar(fileToUpload);
      setAvatarPreview(fileUrl);
      
      closeCropper();
    } catch (e) {
      console.error(e);
      setError("Error cropping image");
    }
  };

  const closeCropper = () => {
    setIsCropping(false);
    // Do not clear imageSrc here! We want to keep it in case the user edits the crop later.
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.username || !formData.password) {
      setError('All text fields are required.');
      return false;
    }
    return true;
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;
    setLoading(true);

    try {
      await axios.post('/api/v1/users/send-otp', {
        email: formData.email,
        fullName: formData.fullName,
      });
      
      setSuccess(`OTP sent to ${formData.email}`);
      setTimeLeft(60); // Reset timer on new OTP
      setStep(2);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^[0-9]+$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value.substring(value.length - 1);
    setOtpValues(newOtpValues);

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0 && inputRefs.current[index - 1]) {
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
      
      const nextIndex = pastedData.length < 6 ? pastedData.length : 5;
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const otpCode = otpValues.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);

    try {
      // Step 2: Verify OTP
      await axios.post('/api/v1/users/verify-otp', {
        email: formData.email,
        otp: otpCode,
      });
      
      setSuccess('Email verified! Finalizing registration...');
      
      // Step 3: Complete Registration with original state
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('username', formData.username);
      data.append('password', formData.password);
      
      if (avatar) {
        data.append('avatar', avatar);
      }
      
      await axios.post('/api/v1/users/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/login', { state: { message: 'Registration successful. Please login!' } });

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please check your email.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {initialLoading ? (
           <div className="auth-initial-skeleton" style={{ padding: '0.5rem' }}>
            <Skeleton type="title" style={{ width: '50%', marginBottom: '0.5rem' }} />
            <Skeleton type="text" style={{ width: '80%', marginBottom: '2.5rem' }} />
            
            <Skeleton type="avatar" />
            
            <Skeleton type="text" style={{ width: '30%', marginBottom: '0.5rem' }} />
            <Skeleton type="input" />
            
            <Skeleton type="text" style={{ width: '30%', marginBottom: '0.5rem' }} />
            <Skeleton type="input" />
            
            <Skeleton type="text" style={{ width: '30%', marginBottom: '0.5rem' }} />
            <Skeleton type="input" />
            
            <Skeleton type="button" style={{ marginTop: '1rem' }} />
           </div>
        ) : (
          <>
            <div className="auth-header">
              <h1 className="auth-title">{step === 1 ? 'Create an Account' : 'Verify Email'}</h1>
              <p className="auth-subtitle">
                {step === 1 
                  ? 'Join us to experience the best of PlayZen.' 
                  : <span>We sent a 6-digit code to <br/><strong>{formData.email}</strong></span>}
              </p>
            </div>

            {error && <div className="auth-error-banner">{error}</div>}
            {success && <div className="auth-success-banner">{success}</div>}

            {step === 1 ? (
              <form onSubmit={handleSignupSubmit} className="auth-form" encType="multipart/form-data">
              
              <div className="auth-input-group file-upload-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '0.25rem' }}>
                {avatarPreview ? (
                  <div className="avatar-preview-container" style={{ position: 'relative', width: '85px', height: '85px' }}>
                    <img 
                       src={avatarPreview} 
                       alt="Avatar" 
                       onClick={() => setIsCropping(true)}
                       style={{
                         width: '100%', height: '100%', objectFit: 'cover', 
                         borderRadius: '50%', border: '2px solid var(--accent-color)', 
                         cursor: 'pointer',
                         boxShadow: '0 4px 14px rgba(212, 212, 212, 0.4)'
                       }} 
                       title="Click to edit crop"
                    />
                    <button type="button" className="avatar-remove-btn" onClick={clearImage} style={{ position: 'absolute', top: '0', right: '0', background: '#ef4444', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-secondary)', cursor: 'pointer', zIndex: 10, transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <label 
                      htmlFor="avatar-input" 
                      className="avatar-dropzone"
                      style={{
                        width: '85px', 
                        height: '85px', 
                        borderRadius: '50%', 
                        border: '2px dashed var(--border-color)', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer',
                        background: 'rgba(18, 18, 18, 0.5)',
                        transition: 'all 0.3s ease',
                        color: 'var(--text-muted)',
                        padding: '0.5rem',
                        boxSizing: 'border-box'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-color)';
                        e.currentTarget.style.color = 'var(--accent-color)';
                        e.currentTarget.style.background = 'rgba(212, 212, 212, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.background = 'rgba(18, 18, 18, 0.5)';
                      }}
                    >
                      <Camera size={26} style={{ marginBottom: '0.2rem' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: '500', fontFamily: 'Orbitron, sans-serif', textAlign: 'center', lineHeight: '1.2' }}>Upload Photo</span>
                    </label>
                    <input 
                      id="avatar-input"
                      name="avatar"
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                )}
              </div>

              <div className="auth-input-group">
                <label className="auth-label" htmlFor="fullName">Full Name</label>
                <input 
                  id="fullName"
                  name="fullName"
                  type="text" 
                  className="auth-input" 
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="auth-input-group">
                <label className="auth-label" htmlFor="username">Username</label>
                <input 
                  id="username"
                  name="username"
                  type="text" 
                  className="auth-input" 
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </div>

              <div className="auth-input-group">
                <label className="auth-label" htmlFor="email">Email Address</label>
                <input 
                  id="email"
                  name="email"
                  type="email" 
                  className="auth-input" 
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="auth-input-group">
                <label className="auth-label" htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"} 
                    className="auth-input" 
                    style={{ paddingRight: '2.5rem' }}
                    value={formData.password}
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

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Processing...' : 'Sign Up'}
              </button>

              <div className="auth-divider" style={{ display: 'flex', alignItems: 'center', margin: '0.4rem 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--bg-tertiary)' }}></div>
                <span style={{ margin: '0 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--bg-tertiary)' }}></div>
              </div>

              <button 
                type="button" 
                className="auth-google-btn" 
                onClick={() => window.location.href = 'http://localhost:8000/api/v1/users/auth/google'}
                style={{
                  width: '100%', padding: '0.75rem', background: 'transparent', 
                  border: '1px solid var(--bg-tertiary)', borderRadius: '8px', color: 'var(--text-primary)',
                  fontSize: '0.95rem', fontWeight: '500', cursor: 'pointer', 
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                  transition: 'all 0.2s', fontFamily: 'Orbitron, sans-serif'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--bg-tertiary)'; }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="auth-form">
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

                <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontFamily: 'Orbitron, sans-serif' }}>
                  Time remaining: <span style={{ color: timeLeft <= 10 ? '#ef4444' : 'var(--accent-color)', fontWeight: 'bold' }}>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading || timeLeft === 0} style={{ marginTop: '1rem' }}>
                  {loading ? 'Verifying...' : 'Verify OTP & Finish'}
                </button>

                <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
                  <p className="auth-footer-text">
                    Didn't receive the code or wrong email?{' '}
                    <button 
                      type="button" 
                      className="auth-link" 
                      style={{ background: 'none', border:'none', cursor:'pointer', padding: 0, fontSize: '0.95rem' }} 
                      onClick={() => { setStep(1); setSuccess(''); setOtpValues(['', '', '', '', '', '']); setError(''); }}
                    >
                      Go back and try again
                    </button>
                  </p>
                </div>
              </form>
            )}
          </>
        )}
      </div>

      {isCropping && (
        <div className="crop-modal-overlay">
          <div className="crop-modal-content">
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'white', textAlign: 'center' }}>Crop Your Image</h3>
            <div className="crop-container" style={{ position: 'relative', width: '100%', maxHeight: '60vh', background: '#333', borderRadius: '10px', overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
              <ReactCrop
                 crop={crop}
                 onChange={(_, percentCrop) => setCrop(percentCrop)}
                 onComplete={(c) => setCompletedCrop(c)}
                 circularCrop={true}
                 aspect={1}
                 style={{ maxHeight: '60vh' }}
              >
                 <img ref={imgRef} src={imageSrc} onLoad={onImageLoad} alt="Crop Preview" style={{ maxHeight: '60vh', width: 'auto' }} />
              </ReactCrop>
            </div>
            
            <div className="crop-modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={closeCropper} style={{ padding: '0.5rem 1rem', background: 'var(--border-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={showCroppedImage} style={{ padding: '0.5rem 1rem', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Crop & Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
