import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  return (
    <div className="settings-page-container">
      <div className="settings-header">
        <SettingsIcon className="settings-icon" size={32} />
        <h1 className="settings-title">Settings</h1>
      </div>
      <div className="settings-content-wrapper">
        <div className="settings-sidebar">
          <ul>
            <li className="active">Account</li>
            <li>Notifications</li>
            <li>Privacy</li>
            <li>Playback</li>
          </ul>
        </div>
        <div className="settings-content-area">
          <div className="settings-card">
            <h2>Account Details</h2>
            <p className="settings-muted">Manage your personal information and preferences.</p>
            <div className="settings-list">
              <div className="settings-item">
                <span>Email Address</span>
                <button className="settings-btn">Update</button>
              </div>
              <div className="settings-item">
                <span>Password</span>
                <button className="settings-btn">Change</button>
              </div>
              <div className="settings-item">
                <span>Theme</span>
                <button className="settings-btn">Dark Mode (Active)</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
