import React from 'react';
import { PlaySquare } from 'lucide-react';
import './Shorts.css';

const Shorts = () => {
  return (
    <div className="shorts-page-container">
      <div className="shorts-header">
        <PlaySquare className="shorts-icon" size={32} />
        <h1 className="shorts-title">Shorts</h1>
      </div>
      <div className="shorts-content-placeholder">
        <PlaySquare className="shorts-placeholder-icon" size={64} />
        <h2>Swipe up for more</h2>
        <p>The Shorts feed is currently empty. Start uploading short vertically filmed videos to see them here.</p>
      </div>
    </div>
  );
};

export default Shorts;
