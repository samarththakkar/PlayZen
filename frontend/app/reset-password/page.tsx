'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/api-services';
import toast from 'react-hot-toast';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import '../forgot-password/forgot-password.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(email, otpString, newPassword);
      toast.success('Password reset successfully');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-bg-gradient" />
      <div className="forgot-orb-1" />
      <div className="forgot-orb-2" />
      <div className="forgot-orb-3" />

      <div className="forgot-max-width">
        <Link href="/login" className="forgot-back-link">
          <ArrowLeft className="forgot-icon-sm" />
          Back to sign in
        </Link>

        <div className="forgot-card">
          <div className="forgot-card-glow-1" />
          <div className="forgot-card-glow-2" />
          
          <div className="forgot-content-wrapper">
            <h1 className="forgot-title">Reset password</h1>
            <p className="forgot-subtitle">
              Enter the OTP sent to {email} and your new password
            </p>

            <form onSubmit={handleSubmit} className="forgot-form">
              <div className="otp-container">
                <label className="otp-label">Enter OTP</label>
                <div className="otp-inputs">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="otp-input"
                      maxLength={1}
                    />
                  ))}
                </div>
              </div>

              <div className="forgot-input-wrapper">
                <div className="forgot-input-icon">
                  <Lock className="forgot-icon-sm" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  required
                  className="forgot-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="forgot-eye-button"
                >
                  {showPassword ? <EyeOff className="forgot-icon-sm" /> : <Eye className="forgot-icon-sm" />}
                </button>
              </div>

              <div className="forgot-input-wrapper">
                <div className="forgot-input-icon">
                  <Lock className="forgot-icon-sm" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  required
                  className="forgot-input"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="forgot-eye-button"
                >
                  {showConfirmPassword ? <EyeOff className="forgot-icon-sm" /> : <Eye className="forgot-icon-sm" />}
                </button>
              </div>

              <button type="submit" disabled={isLoading} className="forgot-submit-button">
                {isLoading ? (
                  <>
                    <div className="forgot-spinner" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
