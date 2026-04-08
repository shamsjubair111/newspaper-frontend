import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ConsentBanner.css';
import { useLang } from '../context/LanguageContext';
import { useT } from '../context/translations';

const ConsentBanner = () => {
  const [visible, setVisible] = useState(false);
  const { lang } = useLang();
  const t = useT(lang);

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
        {t('consentText')}{' '}
        <Link to="/privacy" className="consent-link">{t('consentPrivacy')}</Link>.
      </p>
      <button className="consent-btn" onClick={handleAccept}>
        OK
      </button>
    </div>
  );
};

export default ConsentBanner;