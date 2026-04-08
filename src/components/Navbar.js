import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './NavigationBar.css';
import { useLang } from '../context/LanguageContext';
import { translateBatch } from '../context/translate';
import { translations, useT } from '../context/translations';
import logo from '../assets/logo.png';

const NavigationBar = () => {
  const navigate = useNavigate();
  const user = authAPI.getCurrentUser();
  const { lang, toggleLang, filterDate, setFilterDate, clearFilter } = useLang();
  const t = useT(lang);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // category._id
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calView, setCalView] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [translatedCatNames, setTranslatedCatNames] = useState({});
  const [translatedSubNames, setTranslatedSubNames] = useState({});

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

  // Translate category and subcategory names when language is English
  useEffect(() => {
    if (lang === 'bn' || categories.length === 0) {
      setTranslatedCatNames({});
      setTranslatedSubNames({});
      return;
    }
    const doTranslate = async () => {
      const catTitles = await translateBatch(categories.map(c => c.name));
      const catMap = {};
      categories.forEach((c, i) => { catMap[c._id] = catTitles[i]; });
      setTranslatedCatNames(catMap);

      if (subcategories.length > 0) {
        const subTitles = await translateBatch(subcategories.map(s => s.name));
        const subMap = {};
        subcategories.forEach((s, i) => { subMap[s._id] = subTitles[i]; });
        setTranslatedSubNames(subMap);
      }
    };
    doTranslate();
  }, [lang, categories, subcategories]);

  const getCatName = (cat) => translatedCatNames[cat._id] || cat.name;
  const getSubName = (sub) => translatedSubNames[sub._id] || sub.name;

  const getSubcategoriesForCategory = (categoryId) => {
    return subcategories.filter(sub =>
      sub.category === categoryId || sub.category?._id === categoryId
    );
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  const getCurrentDate = () => {
    const date = new Date();
    const tr = translations[lang];
    const dayName = tr.days[date.getDay()];
    const month = tr.months[date.getMonth()];
    if (lang === 'en') {
      return `${dayName}, ${date.getDate()} ${month} ${date.getFullYear()}`;
    }
    const toBn = (n) => n.toString().split('').map(d => tr.numerals[parseInt(d)]).join('');
    return `${dayName}, ${toBn(date.getDate())} ${month} ${toBn(date.getFullYear())}`;
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

  // ── Calendar helpers ──
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const getArticleDatesForMonth = () => {
    // This is computed on the Navbar level — we just need the active filter indicator
    return {};
  };

  const handleDayClick = (day) => {
    const { year, month } = calView;
    if (filterDate && filterDate.year === year && filterDate.month === month && filterDate.day === day) {
      clearFilter();
    } else {
      setFilterDate({ year, month, day });
    }
    setCalendarOpen(false);
  };

  const handleMonthClick = () => {
    const { year, month } = calView;
    if (filterDate && filterDate.year === year && filterDate.month === month && !filterDate.day) {
      clearFilter();
    } else {
      setFilterDate({ year, month, day: null });
      setCalendarOpen(false);
    }
  };

  const prevMonth = () => setCalView(v => {
    const d = new Date(v.year, v.month - 1, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const nextMonth = () => setCalView(v => {
    const d = new Date(v.year, v.month + 1, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const isFilterActive = filterDate !== null;

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
                placeholder={t('searchPlaceholder')}
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
                <div className="search-status">{t('searchLoading')}</div>
              )}
              {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="search-status">{t('searchNoResult')}</div>
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
                      <span className="search-result-cat">{translatedCatNames[article.category?._id] || article.category?.name}</span>
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

              {/* Calendar filter button */}
              <div style={{ position: 'relative' }}>
                <button
                  className={`icon-btn cal-btn${isFilterActive ? ' cal-btn-active' : ''}`}
                  onClick={() => setCalendarOpen(v => !v)}
                  title={isFilterActive ? 'Clear date filter' : 'Filter by date'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {isFilterActive && <span className="cal-badge" />}
                </button>

                {calendarOpen && (
                  <>
                    <div className="cal-overlay-backdrop" onClick={() => setCalendarOpen(false)} />
                    <div className="cal-dropdown">
                      {/* Month navigation */}
                      <div className="cal-header">
                        <button className="cal-nav-btn" onClick={prevMonth}>&#8249;</button>
                        <button className="cal-month-label" onClick={handleMonthClick}
                          title="Filter by this month">
                          {translations[lang].months[calView.month]} {calView.year}
                          {filterDate && filterDate.year === calView.year && filterDate.month === calView.month && !filterDate.day &&
                            <span className="cal-active-dot" />}
                        </button>
                        <button className="cal-nav-btn" onClick={nextMonth}>&#8250;</button>
                      </div>

                      {/* Day headers */}
                      <div className="cal-grid">
                        {(lang === 'en'
                          ? ['Su','Mo','Tu','We','Th','Fr','Sa']
                          : ['র','স','মঙ','বু','বৃ','শু','শ']
                        ).map(d => (
                          <div key={d} className="cal-day-header">{d}</div>
                        ))}

                        {/* Empty cells for first day offset */}
                        {Array.from({ length: getFirstDayOfMonth(calView.year, calView.month) }).map((_, i) => (
                          <div key={`e${i}`} />
                        ))}

                        {/* Day cells */}
                        {Array.from({ length: getDaysInMonth(calView.year, calView.month) }, (_, i) => i + 1).map(day => {
                          const isSelected = filterDate &&
                            filterDate.year === calView.year &&
                            filterDate.month === calView.month &&
                            filterDate.day === day;
                          const isToday = (() => {
                            const now = new Date();
                            return now.getFullYear() === calView.year &&
                              now.getMonth() === calView.month &&
                              now.getDate() === day;
                          })();
                          return (
                            <button
                              key={day}
                              className={`cal-day${isSelected ? ' cal-day-selected' : ''}${isToday ? ' cal-day-today' : ''}`}
                              onClick={() => handleDayClick(day)}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>

                      {/* Footer */}
                      {isFilterActive && (
                        <div className="cal-footer">
                          <button className="cal-clear-btn" onClick={() => { clearFilter(); setCalendarOpen(false); }}>
                            ✕ {lang === 'en' ? 'Clear filter' : 'ফিল্টার মুছুন'}
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Center: Logo + Date */}
            <div className="logo-section">
              <Link to="/" className="logo-link">
                <img src={logo} alt="সমাচার প্রবাহ" className="logo-img" />
              </Link>
              <div className="date-section">{getCurrentDate()}</div>
            </div>

            {/* Right: Auth */}
            <div className="auth-section">
              {user ? (
                <div className="d-flex align-items-center gap-2">
                <button
                  className="lang-toggle-btn"
                  onClick={toggleLang}
                  title={lang === 'bn' ? 'Switch to English' : 'বাংলায় পড়ুন'}
                >
                  {lang === 'bn' ? 'EN' : 'বাং'}
                </button>
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
                          {t('manageUsers')}
                        </Link></li>
                        <li><Link className="dropdown-item" to="/admin/articles">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                          </svg>
                          {t('manageArticles')}
                        </Link></li>
                        <li><Link className="dropdown-item" to="/admin/categories">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                          </svg>
                          {t('manageCategories')}
                        </Link></li>
                        <li><Link className="dropdown-item" to="/admin/subcategories">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
                          </svg>
                          {t('manageSubcategories')}
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
                          {t('createArticle')}
                        </Link></li>
                        <li><hr className="dropdown-divider" /></li>
                      </>
                    )}

                    {/* All logged-in users */}
                    <li><Link className="dropdown-item" to="/my-bookmarks">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                      </svg>
                      {t('myBookmarks')}
                    </Link></li>
                    <li><Link className="dropdown-item" to="/my-comments">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                      </svg>
                      {t('myComments')}
                    </Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                        </svg>
                        {t('logout')}
                      </button>
                    </li>
                  </ul>
                </div>
                </div>
              ) : (
                <Link to="/login">
                  <button className="login-btn">{t('login')}</button>
                </Link>
              )}

            </div>
          </div>


        </div>
      </div>

      {/* Desktop Navigation Menu */}
      <nav className="main-nav">
        <div className="nav-scroll-wrapper">
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
                    <li
                      key={category._id}
                      className={`nav-item ${hasSubs ? 'has-dropdown' : ''}`}
                      onMouseEnter={(e) => {
                        if (!hasSubs) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        setDropdownPos({ top: rect.bottom, left: rect.left });
                        setOpenDropdown(category._id);
                      }}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <Link to={catUrl(category)} style={{ fontWeight: 'bold' }} className="nav-link">
                        {getCatName(category)}
                      </Link>
                      {hasSubs && openDropdown === category._id && (
                        <ul
                          className="dropdown-submenu"
                          style={{ top: dropdownPos.top, left: dropdownPos.left, display: 'block' }}
                          onMouseEnter={() => setOpenDropdown(category._id)}
                          onMouseLeave={() => setOpenDropdown(null)}
                        >
                          {categorySubs.map((sub) => (
                            <li key={sub._id}>
                              <Link
                                to={subUrl(category, sub)}
                                style={{ fontWeight: 'bold' }}
                                className="submenu-link"
                                onClick={() => setOpenDropdown(null)}
                              >
                                {getSubName(sub)}
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
                          {getCatName(category)}
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
                                {getSubName(sub)}
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
        </div>
      </nav>
    </header>
  );
};

export default NavigationBar;