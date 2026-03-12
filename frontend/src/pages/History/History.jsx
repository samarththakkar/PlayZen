import React from 'react';
import { History as HistoryIcon } from 'lucide-react';
import './History.css';

const History = () => {
  return (
    <div className="history-page-container">
      <div className="history-header">
        <HistoryIcon className="history-icon" size={32} />
        <h1 className="history-title">History</h1>
      </div>
      <div className="history-content-placeholder">
        <HistoryIcon className="history-placeholder-icon" size={64} />
        <h2>Keep track of what you watch</h2>
        <p>Videos you watch will show up here. You can revisit them anytime or remove them from your history.</p>
      </div>
    </div>
  );
};

export default History;
