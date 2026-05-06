import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-wrapper">
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="auth-grid-overlay"></div>

      <header className="auth-top-bar">
        <Link to="/" className="auth-top-brand">
          <div className="auth-top-logo">
            <img src="/logo.png" alt="PlayZen Logo" style={{ width: '45px', height: '35px', objectFit: 'contain' }} />
          </div>
          <span className="auth-top-name">PlayZen</span>
        </Link>
      </header>

      <main className="auth-main">
        <div className="auth-split">
          <div className="auth-right">
            <div className="auth-form-shell">
              <Outlet />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AuthLayout;