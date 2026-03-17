import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

import MainLayout    from './layouts/MainLayout';
import AuthLayout    from './layouts/AuthLayout';

import Home          from './pages/Home';
import Search        from './pages/Search';
import Upload        from './pages/Upload/Upload';
import Profile       from './pages/Profile/Profile';
import Watch         from './pages/Watch/Watch';
import Shorts        from './pages/Shorts/Shorts';
import Subscriptions from './pages/Subscriptions/Subscriptions';
import History       from './pages/History/History';
import WatchLater    from './pages/WatchLater/WatchLater';
import LikedVideos   from './pages/LikedVideos/LikedVideos';
import Settings      from './pages/Settings/Settings';

import Login          from './pages/Auth/Login';
import Signup         from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword  from './pages/Auth/ResetPassword';

import Landing from './pages/Landing/Landing';

/* ── Inline 404 — no extra file needed ── */
const NotFound = () => (
  <div style={{
    minHeight: '100vh',
    background: '#080810',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    fontFamily: "'Inter', sans-serif",
  }}>
    <div style={{
      fontSize: '80px', fontWeight: 700,
      fontFamily: "'Syne', sans-serif",
      background: 'linear-gradient(135deg, #6366F1, #818CF8)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      lineHeight: 1,
    }}>
      404
    </div>
    <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
      Page not found
    </div>
    <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>
      The page you're looking for doesn't exist or has been moved.
    </div>
    <Link to="/" style={{
      padding: '10px 24px',
      background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
      border: '1px solid rgba(99,102,241,0.4)',
      borderRadius: '50px',
      color: '#fff',
      textDecoration: 'none',
      fontSize: '13px',
      fontWeight: 600,
      boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
      transition: 'all 0.2s',
    }}>
      ← Back to Home
    </Link>
  </div>
);

function App() {
  return (
    <div style={{ margin: 0, padding: 0, background: '#080810', minHeight: '100vh' }}>
      <Routes>

        {/* ── MAIN APP (with Header + Sidebar) ── */}
        <Route element={<MainLayout />}>
          <Route path="/"               element={<Home />} />
          <Route path="/search"         element={<Search />} />
          <Route path="/upload"         element={<Upload />} />
          <Route path="/watch/:videoId" element={<Watch />} />
          <Route path="/shorts"         element={<Shorts />} />
          <Route path="/subscriptions"  element={<Subscriptions />} />
          <Route path="/history"        element={<History />} />
          <Route path="/watch-later"    element={<WatchLater />} />
          <Route path="/liked-videos"   element={<LikedVideos />} />
          <Route path="/settings"       element={<Settings />} />
          {/* Profile — own channel or by username */}
          <Route path="/profile"            element={<Profile />} />
          <Route path="/channel"            element={<Profile />} />
          <Route path="/channel/:username"  element={<Profile />} />
        </Route>

        {/* ── AUTH (shared left panel, no sidebar) ── */}
        <Route element={<AuthLayout />}>
          <Route path="/login"           element={<Login />} />
          <Route path="/signup"          element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />
        </Route>

        {/* ── LANDING (standalone, no sidebar/header) ── */}
        <Route path="/landing" element={<Landing />} />

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </div>
  );
}

export default App;