'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import './login.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const { login } = useAuthStore();
  const router = useRouter();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = { email: '', password: '' };
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    if (newErrors.email || newErrors.password) return;

    setIsLoading(true);
    try {
      await login(email, password);
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      toast.success('Logged in successfully');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const isEmailFocused = focusedField === 'email';
  const isPasswordFocused = focusedField === 'password';
  const hasEmailValue = email.length > 0;
  const hasPasswordValue = password.length > 0;

  return (
    <div className="login-container">
      <div className="login-bg-gradient" />
      <div className="login-orb-1" />
      <div className="login-orb-2" />
      <div className="login-orb-3" />

      <div className="login-max-width">
        <div className="login-card">
          <div className="login-card-glow-1" />
          <div className="login-card-glow-2" />
          
          <div className="login-content-wrapper">
            <div className="login-form-container">
              <div className="login-logo-container">
                <Link href="/" className="login-logo-link">
                  <h2 className="login-brand-name">PlayZen</h2>
                  <h2 className="login-wish">Welcome back! </h2>
                  <p className="login-text">Sign in to continue to your account</p>
                </Link>
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                <div className="login-input-wrapper">
                  <div className="login-input-icon">
                    <Mail className="login-icon-sm" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: '' }); }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Email"
                    aria-label="Email address"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={`login-input ${errors.email ? 'error' : ''}`}
                  />
                  {errors.email && (
                    <div id="email-error" className="login-error-message">
                      <AlertCircle className="login-icon-xs" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                <div className="login-input-wrapper">
                  <div className="login-input-icon">
                    <Lock className="login-icon-sm" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: '' }); }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Password"
                    aria-label="Password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className={`login-input login-input-password ${errors.password ? 'error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="login-eye-button"
                  >
                    {showPassword ? <EyeOff className="login-icon-sm" /> : <Eye className="login-icon-sm" />}
                  </button>
                  {errors.password && (
                    <div id="password-error" className="login-error-message">
                      <AlertCircle className="login-icon-xs" />
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>

                <div className="login-remember-forgot">
                  <label className="login-remember-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="login-checkbox"
                    />
                    <span className="login-remember-text">Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="login-forgot-link">
                    Forgot password?
                  </Link>
                </div>

                <button type="submit" disabled={isLoading} className="login-submit-button">
                  {isLoading ? (
                    <>
                      <div className="login-spinner" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    'Sign in'
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
                  Don't have an account?{' '}
                  <Link href="/register" className="login-signup-link" prefetch={false}>
                    Sign up
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
