import React, { useEffect, useRef } from 'react';
import './Landing.css';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          } else {
            // Optional: remove class to repeat animation on scroll up
            entry.target.classList.remove('visible');
          }
        });
      },
      {
        threshold: 0.2, // Trigger when 20% of element is visible
        rootMargin: '0px'
      }
    );

    const hiddenElements = document.querySelectorAll('.fade-in-element');
    hiddenElements.forEach((el) => observer.observe(el));

    return () => {
      hiddenElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="modern-landing" ref={containerRef}>
      {/* 1. Midnight Blue Hero */}
      <section className="landing-section hero-section">
        <div className="noise-overlay"></div>
        <div className="section-content text-center fade-in-element">
          <div className="badge">New Release</div>
          <h1 className="hero-title">
            The Future of <br />
            <span className="text-gradient">Video Entertainment</span>
          </h1>
          <p className="hero-description">
            Experience smooth playback, AI-driven recommendations, and unparalleled quality in a dark, immersive environment.
          </p>
          <div className="btn-group">
            <button className="btn btn-primary glow" onClick={() => navigate('/signup')}>
              Get Started
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/login')}>
              Log In
            </button>
          </div>
        </div>
      </section>

      {/* 2. Dark Slate Features */}
      <section className="landing-section dark-slate-section">
        <div className="noise-overlay"></div>
        <div className="section-content fade-in-element">
          <div className="header-box">
            <h2 className="section-heading">Unmatched Performance</h2>
            <p className="section-subheading">
              A robust architecture designed to deliver videos instantly without buffering, in a premium viewing environment.
            </p>
          </div>
          <div className="cards-grid">
            <div className="glass-card fade-in-element delay-1">
              <div className="icon">🚀</div>
              <h3>Lightning Fast</h3>
              <p>Optimized delivery network ensures minimal loading times anywhere in the world.</p>
            </div>
            <div className="glass-card fade-in-element delay-2">
              <div className="icon">🌙</div>
              <h3>True Dark Mode</h3>
              <p>Carefully crafted shades to reduce eye strain and elevate your focus on content.</p>
            </div>
            <div className="glass-card fade-in-element delay-3">
              <div className="icon">✨</div>
              <h3>4K Ready</h3>
              <p>Enjoy pristine resolution without any compromise on viewing quality and frames.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Deep Navy Creator Focus */}
      <section className="landing-section deep-navy-section">
        <div className="noise-overlay"></div>
        <div className="section-content dual-layout">
          <div className="text-column fade-in-element">
            <h2 className="section-heading">Empowering Creators</h2>
            <p className="section-subheading">
              Advanced analytics, one-click monetization, and community building tools all baked directly into the core platform experience.
            </p>
            <ul className="feature-list">
              <li>Detailed demographic insights</li>
              <li>Real-time engagement tracking</li>
              <li>Direct fan support features</li>
            </ul>
            <button className="btn btn-outline" onClick={() => navigate('/upload')}>
              Start Uploading
            </button>
          </div>
          <div className="visual-column fade-in-element delay-2">
            <div className="floating-dashboard">
              <div className="mock-header"></div>
              <div className="mock-body">
                <div className="mock-graph"></div>
                <div className="mock-stats">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Charcoal CTA */}
      <section className="landing-section charcoal-section">
        <div className="noise-overlay"></div>
        <div className="section-content text-center fade-in-element">
          <h2 className="section-heading">Ready to Dive In?</h2>
          <p className="section-subheading max-w-lg mx-auto">
            Join the fastest growing video platform today. Start discovering content that matters to you.
          </p>
          <button className="btn btn-primary btn-large mt-8" onClick={() => navigate('/')}>
            Explore PlayHub
          </button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
