import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Search from './pages/Search'
import Watch from './pages/Watch'
import History from './pages/History'
import LikedVideos from './pages/LikedVideos'
import Subscriptions from './pages/Subscriptions'
import Shorts from './pages/Shorts'
import Channel from './pages/Channel'
import Studio from './pages/Studio'
import Upload from './pages/Upload'
import Settings from './pages/Settings'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AuthCallback from './pages/AuthCallback'
import Playlists from './pages/Playlists'
import PlaylistView from './pages/PlaylistView'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/watch/:videoId" element={<Watch />} />
        <Route path="/search" element={<Search />} />
        <Route path="/shorts" element={<Shorts />} />
        <Route path="/feed/history" element={<History />} />
        <Route path="/liked" element={<LikedVideos />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/playlist/:playlistId" element={<PlaylistView />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/channel/:username" element={<Channel />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<div className="p-8 text-white">404 - Page Not Found</div>} />
      </Routes>
    </Router>
  )
}

export default App
