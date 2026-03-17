import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-wrapper">

      {/* Ambient orbs */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>

      {/* Top brand bar */}
      <header className="auth-top-bar">
        <Link to="/" className="auth-top-brand">
          <div className="auth-top-logo">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="white">
              <path d="M5 3l14 9-14 9V3z"/>
            </svg>
          </div>
          <span className="auth-top-name">PlayZen</span>
        </Link>
      </header>

      {/* Card */}
      <main className="auth-main">
        <div className="auth-split">

          {/* ── SHARED LEFT PANEL — never changes ── */}
          <div className="auth-left">

            {/* Mobile brand */}
            <div className="auth-brand-mobile">PlayZen</div>

            {/* Desktop visual */}
            <div className="auth-visual-wrap">
              <div className="auth-crystal">
                <div className="c-sq c-sq1"></div>
                <div className="c-sq c-sq2"></div>
                <div className="c-sq c-sq3"></div>
                <div className="c-dot"></div>
              </div>
            </div>

            {/* Desktop copy */}
            <div className="auth-left-copy">
              <div className="auth-brand-text">PLAYZEN</div>
              <div className="left-tagline">Built for creators,<br/>powered by PlayZen.</div>
              <div className="left-sub">Join 50k+ premium creators.</div>
            </div>

            {/* Features */}
            <div className="auth-features">
              <div className="auth-feat">
                <div className="auth-feat-icon">
                  <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"/></svg>
                </div>
                <div>
                  <div className="auth-feat-title">4K Streaming</div>
                  <div className="auth-feat-text">Broadcast in stunning quality</div>
                </div>
              </div>
              <div className="auth-feat">
                <div className="auth-feat-icon">
                  <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"/></svg>
                </div>
                <div>
                  <div className="auth-feat-title">AI Powered</div>
                  <div className="auth-feat-text">Intelligent content workflows</div>
                </div>
              </div>
              <div className="auth-feat">
                <div className="auth-feat-icon">
                  <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"/></svg>
                </div>
                <div>
                  <div className="auth-feat-title">Creator Hub</div>
                  <div className="auth-feat-text">Join 50k+ premium creators</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL — swaps per route ── */}
          <div className="auth-right">
            <Outlet />
          </div>

        </div>
      </main>
    </div>
  );
};

export default AuthLayout;