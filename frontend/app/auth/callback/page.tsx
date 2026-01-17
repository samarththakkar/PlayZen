'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import toast from 'react-hot-toast';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setToken } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Authentication failed');
      router.push('/login');
      return;
    }

    if (token) {
      setToken(token);
      localStorage.setItem('token', token);
      
      // Fetch user data
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.message) {
            setUser(data.message);
            toast.success('Logged in successfully');
            router.push('/');
          }
        })
        .catch(() => {
          toast.error('Failed to fetch user data');
          router.push('/login');
        });
    } else {
      router.push('/login');
    }
  }, [searchParams, router, setUser, setToken]);

  return (
    <div className="min-h-screen bg-yt-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-yt-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-yt-white text-lg">Completing sign in...</p>
      </div>
    </div>
  );
}
