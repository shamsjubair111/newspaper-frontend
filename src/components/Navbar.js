import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './NavigationBar.css';

const NavigationBar = () => {
  const navigate = useNavigate();
  const user = authAPI.getCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      try {
        setLoading(true);
        const categoriesResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/categories`);
        const categoriesData = await categoriesResponse.json();
        const subcategoriesResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/subcategories`);
        const subcategoriesData = await subcategoriesResponse.json();
        setCategories(categoriesData);
        setSubcategories(subcategoriesData);
      } catch (err) {
        console.error('Error fetching menu data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoriesAndSubcategories();
  }, []);

  const getSubcategoriesForCategory = (categoryId) => {
    return subcategories.filter(sub =>
      sub.category === categoryId || sub.category?._id === categoryId
    );
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  const getCurrentDateBengali = () => {
    const date = new Date();
    const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const dayName = days[date.getDay()];
    const day = date.getDate().toString().split('').map(d => bengaliNumerals[parseInt(d)]).join('');
    const month = months[date.getMonth()];
    const year = date.getFullYear().toString().split('').map(d => bengaliNumerals[parseInt(d)]).join('');
    return `${dayName}, ${day} ${month} ${year}`;
  };

  // Build category URL using name (Bengali)
  const catUrl = (cat) => `/${encodeURIComponent(cat.name)}`;
  const subUrl = (cat, sub) => `/${encodeURIComponent(cat.name)}/${encodeURIComponent(sub.name)}`;

  const handleSearchOpen = () => {
    setSearchOpen(true);
    setSearchQuery('');
    setSearchResults([]);
    setTimeout(() => document.getElementById('navbar-search-input')?.focus(), 100);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearchChange = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length < 2) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/articles?search=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      // data may be array directly or { articles: [] } depending on your API
      const list = Array.isArray(data) ? data : (data.articles || []);
      // client-side filter by title as fallback
      const filtered = list.filter(a =>
        a.title?.toLowerCase().includes(q.toLowerCase()) ||
        a.title?.includes(q)
      );
      setSearchResults(filtered.slice(0, 8));
    } catch (err) {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleResultClick = (articleId) => {
    handleSearchClose();
    navigate(`/article/${articleId}`);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') handleSearchClose();
  };

  return (
    <header className="protichinta-header">
      {/* Search Overlay */}
      {searchOpen && (
        <div className="search-overlay">
          <div className="search-overlay-inner">
            <div className="search-input-row">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="search-overlay-icon">
                <circle cx="11" cy="11" r="8" stroke="#999" strokeWidth="2"/>
                <path d="M21 21L16.65 16.65" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                id="navbar-search-input"
                className="search-overlay-input"
                type="text"
                placeholder="শিরোনাম দিয়ে অনুসন্ধান করুন..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                autoComplete="off"
              />
              <button className="search-close-btn" onClick={handleSearchClose} aria-label="Close search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Results */}
            <div className="search-results">
              {searchLoading && (
                <div className="search-status">অনুসন্ধান চলছে...</div>
              )}
              {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="search-status">কোনো ফলাফল পাওয়া যায়নি।</div>
              )}
              {searchResults.map(article => (
                <div
                  key={article._id}
                  className="search-result-item"
                  onClick={() => handleResultClick(article._id)}
                >
                  {article.thumbnail && (
                    <img src={article.thumbnail} alt="" className="search-result-thumb" />
                  )}
                  <div className="search-result-info">
                    <p className="search-result-title">{article.title}</p>
                    {article.category?.name && (
                      <span className="search-result-cat">{article.category.name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Click outside to close */}
          <div className="search-overlay-backdrop" onClick={handleSearchClose} />
        </div>
      )}
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-content">

            {/* Left: Hamburger & Search */}
            <div className="left-icons">
              <button className="icon-btn menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <button className="icon-btn search-btn" onClick={handleSearchOpen}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Center: Logo */}
            <div className="logo-section mt-4">
              <Link to="/" className="logo-link">
                <h1 className="logo-main">সমাচার প্রবাহ</h1>
                <p className="logo-subtitle">সমাজ, সংস্কৃতি ও মুক্তচিন্তার ত্রৈমাসিক</p>
              </Link>
            </div>

            {/* Right: Auth */}
            <div className="auth-section">
              {user ? (
                <div className="dropdown">
                  <button className="login-btn dropdown-toggle" data-bs-toggle="dropdown">
                    {user.name}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <span className="dropdown-item-text">
                        <strong>{user.name}</strong>
                        <br />
                        <small className="text-muted">{user.email}</small>
                        <br />
                        <span className={`badge mt-1 ${user.role === 'admin' ? 'bg-danger' : user.role === 'author' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                          {user.role}
                        </span>
                      </span>
                    </li>
                    <li><hr className="dropdown-divider" /></li>

                    {/* Admin links */}
                    {user.role === 'admin' && (
                      <>
                        <li><Link className="dropdown-item" to="/admin/users">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                          </svg>
                          Manage Users
                        </Link></li>
                        <li><Link className="dropdown-item" to="/create-category">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                            <path d="M12 5v14M5 12h14"/>
                          </svg>
                          Add Category
                        </Link></li>
                        <li><Link className="dropdown-item" to="/create-sub-category">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                            <path d="M12 5v14M5 12h14"/>
                          </svg>
                          Add Subcategory
                        </Link></li>
                        <li><hr className="dropdown-divider" /></li>
                      </>
                    )}

                    {/* Author / Admin links */}
                    {(user.role === 'author' || user.role === 'admin') && (
                      <>
                        <li><Link className="dropdown-item" to="/create-article">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Create Article
                        </Link></li>
                        <li><hr className="dropdown-divider" /></li>
                      </>
                    )}

                    {/* All logged-in users */}
                    <li><Link className="dropdown-item" to="/my-bookmarks">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                      </svg>
                      My Bookmarks
                    </Link></li>
                    <li><Link className="dropdown-item" to="/my-comments">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                      </svg>
                      My Comments
                    </Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                        </svg>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link to="/login">
                  <button className="login-btn">Login</button>
                </Link>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="date-section">
            {getCurrentDateBengali()}
          </div>
        </div>
      </div>

      {/* Desktop Navigation Menu */}
      <nav className="main-nav">
        <div className="d-flex justify-content-center">
          {loading ? (
            <div className="loading-menu">Loading...</div>
          ) : (
            <>
              {/* Desktop Menu */}
              <ul className="nav-menu desktop-menu">
                {categories.map((category) => {
                  const categorySubs = getSubcategoriesForCategory(category._id);
                  const hasSubs = categorySubs.length > 0;
                  return (
                    <li key={category._id} className={`nav-item ${hasSubs ? 'has-dropdown' : ''}`}>
                      <Link to={catUrl(category)} style={{ fontWeight: 'bold' }} className="nav-link">
                        {category.name}
                      </Link>
                      {hasSubs && (
                        <ul className="dropdown-submenu">
                          {categorySubs.map((sub) => (
                            <li key={sub._id}>
                              <Link
                                to={subUrl(category, sub)}
                                style={{ fontWeight: 'bold' }}
                                className="submenu-link"
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Mobile Menu */}
              {mobileMenuOpen && (
                <div className="mobile-menu">
                  {categories.map((category) => {
                    const categorySubs = getSubcategoriesForCategory(category._id);
                    const hasSubs = categorySubs.length > 0;
                    return (
                      <div key={category._id} className="mobile-nav-item">
                        <Link
                          to={catUrl(category)}
                          className="mobile-nav-link"
                          onClick={() => !hasSubs && setMobileMenuOpen(false)}
                        >
                          {category.name}
                        </Link>
                        {hasSubs && (
                          <div className="mobile-submenu">
                            {categorySubs.map((sub) => (
                              <Link
                                key={sub._id}
                                to={subUrl(category, sub)}
                                className="mobile-submenu-link"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default NavigationBar;