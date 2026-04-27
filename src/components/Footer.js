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
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer-social-btn footer-ig" aria-label="Instagram">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none"/>
                  </svg>
                </a>
                <a href="https://threads.net" target="_blank" rel="noreferrer" className="footer-social-btn footer-th" aria-label="Threads">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
                    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.068v-.072c.024-7.347 4.965-11.997 10.672-11.997 2.557 0 4.819.868 6.545 2.51 1.702 1.62 2.757 3.887 3.054 6.572l-2.497.263c-.497-4.553-3.338-6.85-7.105-6.85-4.271 0-8.16 3.236-8.18 9.497v.064c0 3.02.69 5.395 1.997 6.88 1.264 1.434 3.147 2.163 5.597 2.18h.006c2.174 0 3.816-.54 4.882-1.607.968-.966 1.446-2.317 1.455-4.118-.614.252-1.33.396-2.129.396-1.093 0-2.034-.303-2.717-.878-.752-.63-1.152-1.546-1.152-2.647 0-2.274 1.738-3.761 4.437-3.761.476 0 .94.044 1.383.13-.055-.84-.27-1.527-.64-2.035-.453-.617-1.147-.944-2.06-.972h-.073c-.966 0-1.86.416-2.516 1.17l-1.895-1.57C9.91 4.97 11.104 4.375 12.496 4.375h.096c1.504.044 2.745.603 3.589 1.617.772.93 1.175 2.2 1.19 3.766.49.351.901.773 1.22 1.257.597.898.908 2.01.908 3.218 0 2.39-.75 4.278-2.17 5.459-1.291 1.07-3.1 1.308-4.143 1.308z"/>
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