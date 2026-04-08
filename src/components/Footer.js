import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { useLang } from '../context/LanguageContext';
import { useT } from '../context/translations';

const Footer = () => {
  const { lang } = useLang();
  const t = useT(lang);
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">

            {/* Logo + Tagline */}
            <div className="footer-brand">
              <Link to="/" className="footer-logo-link">
                <div className="footer-logo-box">
                  <span className="footer-logo-bn">সমা</span>
                  <span className="footer-logo-accent">চার</span>
                  <span className="footer-logo-sub">প্রবাহ</span>
                </div>
              </Link>
              <p className="footer-tagline">{t('footerTagline')}</p>
              <div className="footer-social">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="footer-social-btn footer-fb" aria-label="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                </a>
                <a href="https://x.com" target="_blank" rel="noreferrer" className="footer-social-btn footer-x" aria-label="X">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 1 */}
            <div className="footer-col">
              <h4 className="footer-col-title">{t('footerCategories')}</h4>
              <ul className="footer-links">
                <li><Link to="/প্রবন্ধ">{t('footerLinkProbandhya')}</Link></li>
                <li><Link to="/%E0%A6%AC%E0%A6%BF%E0%A6%B6%E0%A7%87%E0%A6%B7%20%E0%A6%B8%E0%A7%8D%E0%A6%AC%E0%A6%BE%E0%A6%95%E0%A7%8D%E0%A6%B7%E0%A6%BE%E0%A7%8E%E0%A6%95%E0%A6%BE%E0%A6%B0">{t('footerLinkInterview')}</Link></li>
                <li><Link to="/%E0%A6%85%E0%A6%A8%E0%A7%81%E0%A6%AC%E0%A6%BE%E0%A6%A6">{t('footerLinkTranslation')}</Link></li>
                <li><Link to="/%E0%A6%AC%E0%A7%81%E0%A6%95%20%E0%A6%B0%E0%A6%BF%E0%A6%AD%E0%A6%BF%E0%A6%89">{t('footerLinkBookReview')}</Link></li>
                <li><Link to="/%E0%A6%B0%E0%A6%BE%E0%A6%9C%E0%A6%A8%E0%A7%80%E0%A6%A4%E0%A6%BF">{t('footerLinkNibandha')}</Link></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div className="footer-col">
              <h4 className="footer-col-title">{t('footerInfo')}</h4>
              <ul className="footer-links">
                <li><Link to="/archive">{t('footerLinkArchive')}</Link></li>
                <li><Link to="/about">{t('footerLinkAbout')}</Link></li>
                <li><Link to="/submission">{t('footerLinkSubmission')}</Link></li>
                <li><Link to="/contact">{t('footerLinkContact')}</Link></li>
                <li><Link to="/privacy">{t('footerLinkPrivacy')}</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-col">
              <h4 className="footer-col-title">{t('footerContact')}</h4>
              <div className="footer-contact">
                <p className="footer-contact-name">{t('footerContactName')}</p>
                <p>{t('footerAddress')}</p>
                <p>{t('footerCity')}</p>
                <p>{t('footerPhone')}</p>
                <p>{t('footerEmail')}<a href="mailto:info@samacharprabhah.com">info@samacharprabhah.com</a></p>
                <div className="footer-staff">
                  <p><strong>{t('footerEditor')}</strong>{t('footerEditorName')}</p>
                  <p><strong>{t('footerExecEditor')}</strong>{t('footerExecEditorName')}</p>
                  <p><strong>{t('footerAssocEditor')}</strong>{t('footerAssocEditorName')}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container">
          <p>{t('footerCopyright', new Date().getFullYear())}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;