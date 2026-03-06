import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
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
              <p className="footer-tagline">সত্য, বস্তুনিষ্ঠ ও মানসম্পন্ন সংবাদের উৎস</p>
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
              <h4 className="footer-col-title">বিভাগ</h4>
              <ul className="footer-links">
                <li><Link to="/প্রবন্ধ">প্রবন্ধ</Link></li>
                <li><Link to="/%E0%A6%AC%E0%A6%BF%E0%A6%B6%E0%A7%87%E0%A6%B7%20%E0%A6%B8%E0%A7%8D%E0%A6%AC%E0%A6%BE%E0%A6%95%E0%A7%8D%E0%A6%B7%E0%A6%BE%E0%A7%8E%E0%A6%95%E0%A6%BE%E0%A6%B0">সাক্ষাৎকার</Link></li>
                <li><Link to="/%E0%A6%85%E0%A6%A8%E0%A7%81%E0%A6%AC%E0%A6%BE%E0%A6%A6">অনুবাদ</Link></li>
                <li><Link to="/%E0%A6%AC%E0%A7%81%E0%A6%95%20%E0%A6%B0%E0%A6%BF%E0%A6%AD%E0%A6%BF%E0%A6%89">বই আলোচনা</Link></li>
                <li><Link to="/%E0%A6%B0%E0%A6%BE%E0%A6%9C%E0%A6%A8%E0%A7%80%E0%A6%A4%E0%A6%BF">নিবন্ধ</Link></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div className="footer-col">
              <h4 className="footer-col-title">তথ্য</h4>
              <ul className="footer-links">
                <li><Link to="/archive">আর্কাইভ</Link></li>
                <li><Link to="/about">সমাচার প্রবাহ সম্পর্কে</Link></li>
                <li><Link to="/submission">লেখা পাঠানোর নিয়ম</Link></li>
                <li><Link to="/contact">যোগাযোগ</Link></li>
                <li><Link to="/privacy">গোপনীয়তা নীতি</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-col">
              <h4 className="footer-col-title">যোগাযোগ</h4>
              <div className="footer-contact">
                <p className="footer-contact-name">সমাচার প্রবাহ</p>
                <p>প্রগতি ইন্স্যুরেন্স ভবন</p>
                <p>২০-২১ কারওয়ান বাজার, ঢাকা ১২১৫</p>
                <p>ফোন: ০১১৬০০৭৬-৮১</p>
                <p>ইমেইল: <a href="mailto:info@samacharprabhah.com">info@samacharprabhah.com</a></p>
                <div className="footer-staff">
                  <p><strong>সম্পাদক ও প্রকাশক:</strong> মতিউর রহমান</p>
                  <p><strong>নির্বাহী সম্পাদক:</strong> মোহাম্মদ সাজ্জাদুর রহমান</p>
                  <p><strong>সহযোগী সম্পাদক:</strong> হালিলুল্লাহ</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} সমাচার প্রবাহ। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;