import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Play, 
  Camera, 
  Key, 
  Mail, 
  Lock, 
  Eye, 
  Check,
  Loader2
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import * as settingsService from '../../services/settings.service';
import toast from 'react-hot-toast';
import './Settings.css';

const Settings = () => {
  const { user, updateUserSession } = useContext(AuthContext);
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState('account');

  // Loading states
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [requestingEmailChange, setRequestingEmailChange] = useState(false);
  const [verifyingEmailOTP, setVerifyingEmailOTP] = useState(false);

  // Settings State from Database
  const [dbSettings, setDbSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    privacy: {
      profileVisibility: 'public',
      searchVisibility: true,
    },
    playback: {
      hoverAutoplay: true,
    }
  });

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    username: '',
    bio: '',
  });

  // Previews for file uploads
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Email Change State
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: '',
  });
  const [emailOTPStep, setEmailOTPStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [pendingNewEmail, setPendingNewEmail] = useState('');

  // Protect route
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Load settings and populate form
  useEffect(() => {
    if (!user) return;

    // Populate profile form from auth context user
    setProfileForm({
      fullName: user.fullname || '',
      username: user.username || '',
      bio: user.bio || '',
    });
    setAvatarPreview(user.avatar || '');
    setCoverPreview(user.coverImage || '');

    const fetchDbSettings = async () => {
      try {
        setLoadingSettings(true);
        const { data } = await settingsService.getSettings();
        if (data?.data) {
          const settingsData = data.data;
          setDbSettings({
            emailNotifications: settingsData.emailNotifications ?? true,
            pushNotifications: settingsData.pushNotifications ?? true,
            privacy: {
              profileVisibility: settingsData.privacy?.profileVisibility ?? 'public',
              searchVisibility: settingsData.privacy?.searchVisibility ?? true,
            },
            playback: {
              hoverAutoplay: settingsData.playback?.hoverAutoplay ?? true,
            }
          });
          // Cache in local storage for fast access by other components
          localStorage.setItem('settings', JSON.stringify(settingsData));
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoadingSettings(false);
      }
    };

    fetchDbSettings();
  }, [user]);

  // Handle personal info change
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) {
      toast.error('Full Name is required');
      return;
    }
    if (!profileForm.username.trim()) {
      toast.error('Username is required');
      return;
    }

    try {
      setUpdatingProfile(true);
      const formData = new FormData();
      formData.append('fullName', profileForm.fullName.trim());
      formData.append('username', profileForm.username.trim().toLowerCase());
      formData.append('bio', profileForm.bio.trim());

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      if (coverFile) {
        formData.append('coverImage', coverFile);
      }

      const { data } = await settingsService.updatePersonalInfo(formData);
      const updatedUser = data?.data || data;
      if (updatedUser) {
        updateUserSession(updatedUser);
        setAvatarFile(null);
        setCoverFile(null);
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingProfile(false);
    }
  };

  // File picker handlers
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Change Password Handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setChangingPassword(true);
      await settingsService.changePassword(currentPassword, newPassword);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password changed successfully');
    } catch (err) {
      console.error(err);
    } finally {
      setChangingPassword(false);
    }
  };

  // Request Email Change OTP
  const handleEmailRequestSubmit = async (e) => {
    e.preventDefault();
    const { newEmail, password } = emailForm;

    if (!newEmail || !password) {
      toast.error('New email and password are required');
      return;
    }

    try {
      setRequestingEmailChange(true);
      await settingsService.changeEmail(newEmail.trim(), password);
      setPendingNewEmail(newEmail.trim());
      setEmailOTPStep(true);
      toast.success('Verification OTP sent to new email');
    } catch (err) {
      console.error(err);
    } finally {
      setRequestingEmailChange(false);
    }
  };

  // Verify Email OTP
  const handleEmailOTPVerify = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      toast.error('OTP code is required');
      return;
    }

    try {
      setVerifyingEmailOTP(true);
      await settingsService.verifyNewEmail(otpCode.trim());
      updateUserSession({ email: pendingNewEmail });
      setEmailForm({ newEmail: '', password: '' });
      setOtpCode('');
      setEmailOTPStep(false);
      toast.success('Email updated successfully');
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingEmailOTP(false);
    }
  };

  // Toggle Toggle Switches (Notifications, Privacy, Playback)
  const handleNotificationToggle = async (key, val) => {
    try {
      const nextSettings = { ...dbSettings, [key]: val };
      setDbSettings(nextSettings);
      
      const { data } = await settingsService.updateNotificationSettings(
        key === 'emailNotifications' ? val : dbSettings.emailNotifications,
        key === 'pushNotifications' ? val : dbSettings.pushNotifications
      );
      
      if (data?.data) {
        localStorage.setItem('settings', JSON.stringify(data.data));
      }
    } catch (err) {
      console.error(err);
      // Rollback on error
      setDbSettings(prev => ({ ...prev, [key]: !val }));
    }
  };

  const handlePrivacyToggle = async (key, val) => {
    try {
      const nextPrivacy = { ...dbSettings.privacy, [key]: val };
      setDbSettings(prev => ({ ...prev, privacy: nextPrivacy }));

      const { data } = await settingsService.updatePrivacySettings(
        nextPrivacy.profileVisibility,
        nextPrivacy.searchVisibility
      );

      if (data?.data) {
        localStorage.setItem('settings', JSON.stringify(data.data));
      }
    } catch (err) {
      console.error(err);
      setDbSettings(prev => ({
        ...prev,
        privacy: { ...prev.privacy, [key]: !val }
      }));
    }
  };

  const handlePrivacySelect = async (val) => {
    try {
      const nextPrivacy = { ...dbSettings.privacy, profileVisibility: val };
      setDbSettings(prev => ({ ...prev, privacy: nextPrivacy }));

      const { data } = await settingsService.updatePrivacySettings(
        val,
        dbSettings.privacy.searchVisibility
      );

      if (data?.data) {
        localStorage.setItem('settings', JSON.stringify(data.data));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlaybackToggle = async (val) => {
    try {
      const nextPlayback = { hoverAutoplay: val };
      setDbSettings(prev => ({ ...prev, playback: nextPlayback }));

      const { data } = await settingsService.updatePlaybackSettings(val);
      if (data?.data) {
        localStorage.setItem('settings', JSON.stringify(data.data));
      }
    } catch (err) {
      console.error(err);
      setDbSettings(prev => ({
        ...prev,
        playback: { hoverAutoplay: !val }
      }));
    }
  };

  if (!user || loadingSettings) {
    return (
      <div className="settings-loading-overlay">
        <Loader2 className="spinner" size={48} />
        <p>Loading Preferences...</p>
      </div>
    );
  }

  return (
    <div className="settings-page-container">
      <div className="settings-header">
        <SettingsIcon className="settings-icon" size={32} />
        <h1 className="settings-title">Settings</h1>
      </div>

      <div className="settings-content-wrapper">
        {/* Navigation Sidebar */}
        <div className="settings-sidebar">
          <ul>
            <li 
              className={activeTab === 'account' ? 'active' : ''} 
              onClick={() => setActiveTab('account')}
            >
              <User size={18} />
              <span>Account</span>
            </li>
            <li 
              className={activeTab === 'notifications' ? 'active' : ''} 
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={18} />
              <span>Notifications</span>
            </li>
            <li 
              className={activeTab === 'privacy' ? 'active' : ''} 
              onClick={() => setActiveTab('privacy')}
            >
              <Shield size={18} />
              <span>Privacy</span>
            </li>
            <li 
              className={activeTab === 'playback' ? 'active' : ''} 
              onClick={() => setActiveTab('playback')}
            >
              <Play size={18} />
              <span>Playback</span>
            </li>
          </ul>
        </div>

        {/* Dynamic Settings Fields Area */}
        <div className="settings-content-area animate-fade-in">
          
          {/* ────────────────────────────────────────────────────────
              1. ACCOUNT TAB
          ──────────────────────────────────────────────────────── */}
          {activeTab === 'account' && (
            <div className="settings-section">
              {/* Profile Details Form */}
              <form onSubmit={handleProfileSubmit} className="settings-card">
                <h2>Profile Customization</h2>
                <p className="settings-muted">Update your display information, avatar, and channel cover banner.</p>

                {/* Banner & Avatar Banner Editor */}
                <div className="settings-banner-uploader" style={{ backgroundImage: `url(${coverPreview})` }}>
                  <button 
                    type="button" 
                    className="banner-upload-btn" 
                    onClick={() => coverInputRef.current?.click()}
                    title="Change Cover Banner"
                  >
                    <Camera size={20} />
                  </button>
                  <input 
                    ref={coverInputRef} 
                    type="file" 
                    accept="image/*" 
                    onChange={handleCoverChange} 
                    style={{ display: 'none' }} 
                  />

                  <div className="settings-avatar-container">
                    <img src={avatarPreview || "/default-avatar.png"} alt="Avatar Preview" className="settings-avatar-img" />
                    <button 
                      type="button" 
                      className="avatar-upload-btn" 
                      onClick={() => avatarInputRef.current?.click()}
                      title="Change Avatar"
                    >
                      <Camera size={14} />
                    </button>
                    <input 
                      ref={avatarInputRef} 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarChange} 
                      style={{ display: 'none' }} 
                    />
                  </div>
                </div>

                <div className="form-group-grid">
                  <div className="form-input-container">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                      required 
                    />
                  </div>

                  <div className="form-input-container">
                    <label>Username</label>
                    <input 
                      type="text" 
                      placeholder="e.g. johndoe"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                      required 
                    />
                  </div>
                </div>

                <div className="form-input-container">
                  <label>Bio</label>
                  <textarea 
                    rows={4}
                    placeholder="Tell the community about yourself, your channel, or links..."
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                  />
                </div>

                <div className="card-actions">
                  <button type="submit" className="settings-submit-btn" disabled={updatingProfile}>
                    {updatingProfile ? <Loader2 className="spinner" size={16} /> : 'Save Changes'}
                  </button>
                </div>
              </form>

              {/* Email Update Form */}
              <div className="settings-card mt-2">
                <h2>Email Settings</h2>
                <p className="settings-muted">Change your account's primary email. Requires password confirmation and OTP validation.</p>
                
                {!emailOTPStep ? (
                  <form onSubmit={handleEmailRequestSubmit} className="settings-inner-form">
                    <div className="current-email-badge">
                      <span>Current Email:</span>
                      <strong>{user.email}</strong>
                    </div>

                    <div className="form-group-grid">
                      <div className="form-input-container">
                        <label>New Email Address</label>
                        <div className="input-with-icon">
                          <Mail size={16} className="input-icon" />
                          <input 
                            type="email" 
                            placeholder="new-email@domain.com"
                            value={emailForm.newEmail}
                            onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                            required 
                          />
                        </div>
                      </div>

                      <div className="form-input-container">
                        <label>Confirm Password</label>
                        <div className="input-with-icon">
                          <Lock size={16} className="input-icon" />
                          <input 
                            type="password" 
                            placeholder="Verify account password"
                            value={emailForm.password}
                            onChange={(e) => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
                            required 
                          />
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="settings-submit-btn" disabled={requestingEmailChange}>
                      {requestingEmailChange ? <Loader2 className="spinner" size={16} /> : 'Request Verification OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleEmailOTPVerify} className="settings-inner-form otp-section-wrapper">
                    <div className="otp-alert-info">
                      <p>We've sent a 6-digit OTP code to <strong>{pendingNewEmail}</strong>.</p>
                      <p className="otp-helper-subtext">(Check your terminal logs if developing locally)</p>
                    </div>

                    <div className="form-input-container otp-input-group">
                      <label>Verification OTP Code</label>
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="otp-code-input"
                        required 
                      />
                    </div>

                    <div className="otp-actions">
                      <button type="submit" className="settings-submit-btn" disabled={verifyingEmailOTP}>
                        {verifyingEmailOTP ? <Loader2 className="spinner" size={16} /> : 'Verify & Update Email'}
                      </button>
                      <button 
                        type="button" 
                        className="settings-btn-cancel" 
                        onClick={() => setEmailOTPStep(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Password Settings Form */}
              <form onSubmit={handlePasswordSubmit} className="settings-card mt-2">
                <h2>Security Preferences</h2>
                <p className="settings-muted">Change your current login credential password.</p>

                <div className="form-input-container">
                  <label>Current Password</label>
                  <div className="input-with-icon">
                    <Lock size={16} className="input-icon" />
                    <input 
                      type="password" 
                      placeholder="Current Password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required 
                    />
                  </div>
                </div>

                <div className="form-group-grid">
                  <div className="form-input-container">
                    <label>New Password</label>
                    <div className="input-with-icon">
                      <Key size={16} className="input-icon" />
                      <input 
                        type="password" 
                        placeholder="Min 6 characters"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-input-container">
                    <label>Confirm New Password</label>
                    <div className="input-with-icon">
                      <Key size={16} className="input-icon" />
                      <input 
                        type="password" 
                        placeholder="Confirm password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required 
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="settings-submit-btn" disabled={changingPassword}>
                  {changingPassword ? <Loader2 className="spinner" size={16} /> : 'Change Password'}
                </button>
              </form>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────
              2. NOTIFICATIONS TAB
          ──────────────────────────────────────────────────────── */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <div className="settings-card">
                <h2>Notification Preferences</h2>
                <p className="settings-muted">Configure how and when you want to receive notifications from channel subscriptions and updates.</p>

                <div className="settings-list">
                  <div className="settings-toggle-item">
                    <div className="toggle-details">
                      <h3>Email Notifications</h3>
                      <p>Receive email updates for new videos, subscriber activity, and system newsletters.</p>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={dbSettings.emailNotifications}
                        onChange={(e) => handleNotificationToggle('emailNotifications', e.target.checked)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>

                  <div className="settings-toggle-item">
                    <div className="toggle-details">
                      <h3>Push Notifications</h3>
                      <p>Enable live real-time notifications in-app via Socket.io when subscribed channels release content.</p>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={dbSettings.pushNotifications}
                        onChange={(e) => handleNotificationToggle('pushNotifications', e.target.checked)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────
              3. PRIVACY TAB
          ──────────────────────────────────────────────────────── */}
          {activeTab === 'privacy' && (
            <div className="settings-section">
              <div className="settings-card">
                <h2>Privacy Options</h2>
                <p className="settings-muted">Manage your searchability, subscription listings, and channel profile visibility.</p>

                <div className="settings-list">
                  <div className="settings-toggle-item dropdown-item">
                    <div className="toggle-details">
                      <h3>Profile Visibility</h3>
                      <p>Set whether your channel history, liked videos, and playlists are visible to the public or only you.</p>
                    </div>
                    <div className="select-wrapper">
                      <select 
                        value={dbSettings.privacy.profileVisibility} 
                        onChange={(e) => handlePrivacySelect(e.target.value)}
                        className="settings-select"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>

                  <div className="settings-toggle-item">
                    <div className="toggle-details">
                      <h3>Search Visibility</h3>
                      <p>Allow your username and fullname to be indexed and discoverable in global search bars.</p>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={dbSettings.privacy.searchVisibility}
                        onChange={(e) => handlePrivacyToggle('searchVisibility', e.target.checked)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────
              4. PLAYBACK TAB
          ──────────────────────────────────────────────────────── */}
          {activeTab === 'playback' && (
            <div className="settings-section">
              <div className="settings-card">
                <h2>Playback Preferences</h2>
                <p className="settings-muted">Adjust default media rendering, autoplay settings, and performance settings.</p>

                <div className="settings-list">
                  <div className="settings-toggle-item">
                    <div className="toggle-details">
                      <h3>Hover Autoplay</h3>
                      <p>When hovering over a video card for 3 seconds, automatically play the video inline with sound fallback.</p>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={dbSettings.playback.hoverAutoplay}
                        onChange={(e) => handlePlaybackToggle(e.target.checked)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
