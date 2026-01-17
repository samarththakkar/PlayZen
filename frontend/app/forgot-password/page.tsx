'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/api-services';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import './forgot-password.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success('OTP sent to your email');
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
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
              Enter your email and we'll send you an OTP to reset your password
            </p>

            <form onSubmit={handleSubmit} className="forgot-form">
              <div className="forgot-input-wrapper">
                <div className="forgot-input-icon">
                  <Mail className="forgot-icon-sm" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  aria-label="Email address"
                  className="forgot-input"
                />
              </div>

              <button type="submit" disabled={isLoading} className="forgot-submit-button">
                {isLoading ? (
                  <>
                    <div className="forgot-spinner" />
                    <span>Sending...</span>
                  </>
                ) : (
                  'Send reset OTP'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
