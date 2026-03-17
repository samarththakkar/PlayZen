import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
          else entry.target.classList.remove('visible');
        });
      },
      { threshold: 0.15, rootMargin: '0px' }
    );
    const els = document.querySelectorAll('.fade-in-element');
    els.forEach(el => observer.observe(el));
    return () => els.forEach(el => observer.unobserve(el));
  }, []);

  return (
    <div className="landing">

      {/* ══════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════ */}
      <section className="land-section hero-section">
        <div className="land-orb land-orb-1" />
        <div className="land-orb land-orb-2" />
        <div className="land-noise" />

        <div className="land-nav">
          <div className="land-logo">
            <div className="land-logo-mark">
              <img src="/logo.png" alt="PlayZen Logo" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
            </div>
            <span className="land-logo-name">PlayZen</span>
          </div>
          <div className="land-nav-links">
            <button className="land-nav-link" onClick={() => navigate('/login')}>Sign In</button>
            <button className="land-nav-cta" onClick={() => navigate('/signup')}>Get Started</button>
          </div>
        </div>

        <div className="land-content text-center fade-in-element">
          <div className="land-badge">✦ Now in Beta</div>
          <h1 className="hero-title">
            Create. Share.<br/>
            <span className="land-gradient">Own Your Story.</span>
          </h1>
          <p className="hero-desc">
            The premium video platform built for modern creators.
            Stunning 4K playback, AI-powered tools, and a community that actually cares.
          </p>
          <div className="land-btn-group">
            <button className="land-btn-primary" onClick={() => navigate('/signup')}>
              Start for Free
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button className="land-btn-ghost" onClick={() => navigate('/')}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg>
              Watch Demo
            </button>
          </div>
          <p className="hero-social-proof">Join 50,000+ creators · Free forever · No credit card</p>
        </div>

        {/* Hero floating card */}
        <div className="hero-card-wrap fade-in-element delay-2">
          <div className="hero-card">
            <div className="hc-thumb"></div>
            <div className="hc-info">
              <div className="hc-avatar"></div>
              <div className="hc-text">
                <div className="hc-title"></div>
                <div className="hc-meta"></div>
              </div>
            </div>
          </div>
          <div className="hero-card hero-card-2">
            <div className="hc-thumb hc-thumb-2"></div>
            <div className="hc-info">
              <div className="hc-avatar hc-avatar-2"></div>
              <div className="hc-text">
                <div className="hc-title"></div>
                <div className="hc-meta"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 — FEATURES
      ══════════════════════════════════════ */}
      <section className="land-section features-section">
        <div className="land-orb land-orb-3" />
        <div className="land-noise" />

        <div className="land-content fade-in-element">
          <div className="land-section-header text-center">
            <div className="land-label">Why PlayZen</div>
            <h2 className="land-heading">Everything a creator needs</h2>
            <p className="land-subheading">
              Built from the ground up with creators in mind — not an afterthought.
            </p>
          </div>

          <div className="features-grid">
            {[
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>,
                title: '4K Streaming',
                desc: 'Crystal-clear playback delivered at blazing speeds via our global CDN network.',
              },
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"/></svg>,
                title: 'AI Powered',
                desc: 'Smart recommendations, auto-captions, and content insights powered by AI.',
              },
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/></svg>,
                title: 'Deep Analytics',
                desc: 'Real-time dashboards showing views, retention, revenue, and audience growth.',
              },
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>,
                title: 'Privacy First',
                desc: 'Full control over your content — public, unlisted, or private with one click.',
              },
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"/></svg>,
                title: 'Creator Hub',
                desc: 'Connect with 50k+ creators, collaborate, and grow your audience together.',
              },
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/></svg>,
                title: 'Mobile Ready',
                desc: 'Seamless experience across every device — desktop, tablet, and mobile.',
              },
            ].map((feat, i) => (
              <div key={i} className={`feat-card fade-in-element delay-${(i % 3) + 1}`}>
                <div className="feat-icon">{feat.icon}</div>
                <h3 className="feat-title">{feat.title}</h3>
                <p className="feat-desc">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 3 — CREATOR FOCUS
      ══════════════════════════════════════ */}
      <section className="land-section creator-section">
        <div className="land-orb land-orb-4" />
        <div className="land-noise" />

        <div className="land-content dual-layout">
          <div className="text-col fade-in-element">
            <div className="land-label">For Creators</div>
            <h2 className="land-heading">Built for your<br/>creative workflow</h2>
            <p className="land-subheading">
              Upload, manage, and grow — all from one beautiful dashboard designed to stay out of your way.
            </p>
            <ul className="land-feat-list">
              <li>One-click video publishing</li>
              <li>Detailed audience demographics</li>
              <li>Real-time engagement metrics</li>
              <li>Direct fan support & tips</li>
            </ul>
            <button className="land-btn-primary" onClick={() => navigate('/upload')}>
              Start Uploading
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          <div className="visual-col fade-in-element delay-2">
            <div className="dash-mock">
              <div className="dash-header">
                <div className="dash-h-dot"></div>
                <div className="dash-h-dot"></div>
                <div className="dash-h-dot"></div>
                <div className="dash-h-title"></div>
              </div>
              <div className="dash-body">
                <div className="dash-stats">
                  <div className="dash-stat">
                    <div className="dash-stat-num"></div>
                    <div className="dash-stat-label"></div>
                  </div>
                  <div className="dash-stat">
                    <div className="dash-stat-num"></div>
                    <div className="dash-stat-label"></div>
                  </div>
                  <div className="dash-stat">
                    <div className="dash-stat-num"></div>
                    <div className="dash-stat-label"></div>
                  </div>
                </div>
                <div className="dash-chart">
                  <div className="dash-bar" style={{height:'40%'}}></div>
                  <div className="dash-bar" style={{height:'65%'}}></div>
                  <div className="dash-bar" style={{height:'50%'}}></div>
                  <div className="dash-bar" style={{height:'80%'}}></div>
                  <div className="dash-bar" style={{height:'60%'}}></div>
                  <div className="dash-bar" style={{height:'90%'}}></div>
                  <div className="dash-bar active" style={{height:'75%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 4 — CTA
      ══════════════════════════════════════ */}
      <section className="land-section cta-section">
        <div className="land-orb land-orb-5" />
        <div className="land-orb land-orb-6" />
        <div className="land-noise" />

        <div className="land-content text-center fade-in-element">
          <div className="cta-glow-ring" />
          <div className="land-label">Get Started</div>
          <h2 className="land-heading cta-heading">
            Ready to start<br/>creating?
          </h2>
          <p className="land-subheading">
            Join thousands of creators who chose PlayZen.<br/>
            Free forever. No credit card required.
          </p>
          <div className="land-btn-group">
            <button className="land-btn-primary land-btn-lg" onClick={() => navigate('/signup')}>
              Create Free Account
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button className="land-btn-ghost" onClick={() => navigate('/')}>
              Explore Platform
            </button>
          </div>

          <div className="cta-stats">
            <div className="cta-stat"><span className="cta-stat-num">50K+</span><span className="cta-stat-label">Creators</span></div>
            <div className="cta-divider"></div>
            <div className="cta-stat"><span className="cta-stat-num">4K</span><span className="cta-stat-label">Quality</span></div>
            <div className="cta-divider"></div>
            <div className="cta-stat"><span className="cta-stat-num">Free</span><span className="cta-stat-label">Forever</span></div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;