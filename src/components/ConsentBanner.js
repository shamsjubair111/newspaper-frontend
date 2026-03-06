import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ConsentBanner.css';

const ConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('privacy_consent');
    if (!consent) {
      // Small delay so it doesn't flash on first render
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('privacy_consent', 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="consent-banner">
      <p className="consent-text">
        By using this site, you agree to our{' '}
        <Link to="/privacy" className="consent-link">Privacy Policy</Link>.
      </p>
      <button className="consent-btn" onClick={handleAccept}>
        OK
      </button>
    </div>
  );
};

export default ConsentBanner;