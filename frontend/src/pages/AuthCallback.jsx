
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setToken } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Authentication failed');
      navigate('/login');
      return;
    }

    if (token) {
      setToken(token);
      localStorage.setItem('token', token);
      
      // Fetch user data
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            setUser(data.data);
            toast.success('Logged in successfully');
            navigate('/');
          } else {
             throw new Error('No user data');
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error('Failed to fetch user data');
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, setUser, setToken]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">Completing sign in...</p>
      </div>
    </div>
  );
}
