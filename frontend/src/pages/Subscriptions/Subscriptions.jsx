import React from 'react';
import { Tv } from 'lucide-react';
import './Subscriptions.css';

const Subscriptions = () => {
  return (
    <div className="subscriptions-page-container">
      <div className="subscriptions-header">
        <Tv className="subscriptions-icon" size={32} />
        <h1 className="subscriptions-title">Subscriptions</h1>
      </div>
      <div className="subscriptions-content-placeholder">
        <Tv className="subscriptions-placeholder-icon" size={64} />
        <h2>Catch up on your favorites</h2>
        <p>Videos from channels you subscribe to will appear here. Start exploring and subscribing to see content you love.</p>
      </div>
    </div>
  );
};

export default Subscriptions;
