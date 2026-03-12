import React from 'react';
import { Clock } from 'lucide-react';
import './WatchLater.css';

const WatchLater = () => {
  return (
    <div className="watch-later-page-container">
      <div className="watch-later-header">
        <Clock className="watch-later-icon" size={32} />
        <h1 className="watch-later-title">Watch Later</h1>
      </div>
      <div className="watch-later-content-placeholder">
        <Clock className="watch-later-placeholder-icon" size={64} />
        <h2>Save videos for later</h2>
        <p>Don't have time to watch a video right now? Save it to Watch Later and catch up when you're ready.</p>
      </div>
    </div>
  );
};

export default WatchLater;
