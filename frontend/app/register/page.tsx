'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/api-services';
import { useAuthStore } from '@/store/auth-store';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, User, UserCircle, Upload, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import '../login/login.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullname: '',
    password: '',
    confirmPassword: '',
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ username: '', email: '', fullname: '', password: '', confirmPassword: '' });
  const router = useRouter();
  const { login } = useAuthStore();

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    if (strength <= 2) return { strength, label: 'Weak', color: '#ef4444' };
    if (strength <= 3) return { strength, label: 'Fair', color: '#f59e0b' };
    if (strength <= 4) return { strength, label: 'Good', color: '#3b82f6' };
    return { strength, label: 'Strong', color: '#10b981' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = { username: '', email: '', fullname: '', password: '', confirmPassword: '' };
    if (!formData.fullname) newErrors.fullname = 'Full name is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    if (Object.values(newErrors).some(error => error)) return;

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('fullName', formData.fullname);
      data.append('password', formData.password);
      if (avatar) {
        data.append('avatar', avatar);
      }

      await authService.register(data);
      toast.success('Account created successfully! Logging you in...');
      
      // Auto-login after successful registration
      await login(formData.email, formData.password);
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg-gradient" />
      <div className="login-orb-1" />
      <div className="login-orb-2" />
      <div className="login-orb-3" />

      <div className="login-max-width" style={{ maxWidth: '550px' }}>
        <div className="login-card">
          <div className="login-card-glow-1" />
          <div className="login-card-glow-2" />
          
          <div className="login-content-wrapper">
            <div className="login-form-container">
              <div className="login-logo-container">
                <Link href="/" className="login-logo-link">
                  <h2 className="login-brand-name">PlayZen</h2>
                  <h2 className="login-wish">Create account</h2>
                  <p className="login-text">Join PlayZen to start your journey</p>
                </Link>
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                {/* Avatar Upload */}
                <div className="login-input-wrapper">
                  <label className="avatar-upload-label">Profile Picture (Optional)</label>
                  <div className="avatar-upload-container">
                    <div className="avatar-preview">
                      {avatarPreview ? (
                        <Image
                          src={avatarPreview}
                          alt="Avatar preview"
                          width={60}
                          height={60}
                          className="avatar-image"
                        />
                      ) : (
                        <UserCircle className="avatar-placeholder" />
                      )}
                    </div>
                    <label className="avatar-upload-button">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="avatar-input"
                      />
                      <Upload className="login-icon-xs" />
                      <span>Choose File</span>
                    </label>
                  </div>
                </div>

                {/* Full Name */}
                <div className="login-input-wrapper">
                  <div className="login-input-icon">
                    <User className="login-icon-sm" />
                  </div>
                  <input
                    name="fullname"
                    type="text"
                    value={formData.fullname}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className={`login-input ${errors.fullname ? 'error' : ''}`}
                  />
                  {errors.fullname && (
                    <div className="login-error-message">
                      <AlertCircle className="login-icon-xs" />
                      <span>{errors.fullname}</span>
                    </div>
                  )}
                </div>

                {/* Username */}
                <div className="login-input-wrapper">
                  <div className="login-input-icon">
                    <User className="login-icon-sm" />
                  </div>
                  <input
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username"
                    className={`login-input ${errors.username ? 'error' : ''}`}
                  />
                  {errors.username && (
                    <div className="login-error-message">
                      <AlertCircle className="login-icon-xs" />
                      <span>{errors.username}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="login-input-wrapper">
                  <div className="login-input-icon">
                    <Mail className="login-icon-sm" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className={`login-input ${errors.email ? 'error' : ''}`}
                  />
                  {errors.email && (
                    <div className="login-error-message">
                      <AlertCircle className="login-icon-xs" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="login-input-wrapper">
                  <div className="login-input-icon">
                    <Lock className="login-icon-sm" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className={`login-input login-input-password ${errors.password ? 'error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-eye-button"
                  >
                    {showPassword ? <EyeOff className="login-icon-sm" /> : <Eye className="login-icon-sm" />}
                  </button>
                  {errors.password && (
                    <div className="login-error-message">
                      <AlertCircle className="login-icon-xs" />
                      <span>{errors.password}</span>
                    </div>
                  )}
                  {formData.password && (
                    <div className="password-strength">
                      <div className="password-strength-header">
                        <span className="password-strength-label">Password strength:</span>
                        <span className="password-strength-text" style={{ color: passwordStrength.color }}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="password-strength-bar">
                        <div 
                          className="password-strength-fill"
                          style={{ 
                            width: `${(passwordStrength.strength / 5) * 100}%`,
                            backgroundColor: passwordStrength.color
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="login-input-wrapper">
                  <div className="login-input-icon">
                    <Lock className="login-icon-sm" />
                  </div>
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    className={`login-input login-input-password ${errors.confirmPassword ? 'error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="login-eye-button"
                  >
                    {showConfirmPassword ? <EyeOff className="login-icon-sm" /> : <Eye className="login-icon-sm" />}
                  </button>
                  {errors.confirmPassword && (
                    <div className="login-error-message">
                      <AlertCircle className="login-icon-xs" />
                      <span>{errors.confirmPassword}</span>
                    </div>
                  )}
                </div>

                <button type="submit" disabled={isLoading} className="login-submit-button">
                  {isLoading ? (
                    <>
                      <div className="login-spinner" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    'Create account'
                  )}
                </button>
              </form>

              <div className="login-divider">
                <div className="login-divider-line">
                  <div className="login-divider-border"></div>
                </div>
                <div className="login-divider-text-wrapper">
                  <span className="login-divider-text">Or continue with</span>
                </div>
              </div>

              <div className="login-oauth-container">
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/users/auth/google`}
                  className="login-oauth-button"
                >
                  <svg className="login-oauth-icon" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </a>
              </div>

              <div className="login-signup-wrapper">
                <p className="login-signup-text">
                  Already have an account?{' '}
                  <Link href="/login" className="login-signup-link">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}