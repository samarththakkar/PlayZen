import React from 'react';
import { ThumbsUp } from 'lucide-react';
import './LikedVideos.css';

const LikedVideos = () => {
  return (
    <div className="liked-videos-page-container">
      <div className="liked-videos-header">
        <ThumbsUp className="liked-videos-icon" size={32} />
        <h1 className="liked-videos-title">Liked Videos</h1>
      </div>
      <div className="liked-videos-content-placeholder">
        <ThumbsUp className="liked-videos-placeholder-icon" size={64} />
        <h2>Videos you've liked</h2>
        <p>When you like a video, it will appear here so you can easily find it again.</p>
      </div>
    </div>
  );
};

export default LikedVideos;
