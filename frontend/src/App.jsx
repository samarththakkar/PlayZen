import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import Home from './pages/Home';
import Search from './pages/Search';
import Upload from './pages/Upload/Upload';
import Profile from './pages/Profile/Profile';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Shorts from './pages/Shorts/Shorts';
import Subscriptions from './pages/Subscriptions/Subscriptions';
import History from './pages/History/History';
import WatchLater from './pages/WatchLater/WatchLater';
import LikedVideos from './pages/LikedVideos/LikedVideos';
import Settings from './pages/Settings/Settings';
import Watch from './pages/Watch/Watch';
import Landing from './pages/Landing/Landing';

function App() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen m-0 p-0">
      <Routes>
      {/* Routes with Main Navbar and Sidebar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/channel" element={<Profile />} />
        <Route path="/channel/:username" element={<Profile />} />
        <Route path="/shorts" element={<Shorts />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/history" element={<History />} />
        <Route path="/watch-later" element={<WatchLater />} />
        <Route path="/liked-videos" element={<LikedVideos />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/watch/:videoId" element={<Watch />} />
      </Route>

      {/* Auth Routes (no sidebar/navbar) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>
      
      {/* Landing Route (no sidebar/navbar) */}
      <Route path="/landing" element={<Landing />} />
      
      {/* Catch all */}
      <Route path="*" element={<div className="p-10 text-center">404 - Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;
