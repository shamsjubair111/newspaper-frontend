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

  return (
    <header className="protichinta-header">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-content">
            {/* Left: Menu & Search */}
            <div className="left-icons">
              <button 
                className="icon-btn menu-btn" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <button className="icon-btn search-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Center: Logo */}
            <div className="logo-section mt-4">
              <Link to="/" className="logo-link">
                <h1 className="logo-main">প্রতিচিন্তা</h1>
                <p className="logo-subtitle">সমাজ, সংস্কৃতি ও মুক্তচিন্তার ত্রৈমাসিক</p>
              </Link>
            </div>

            {/* Right: Login/User */}
            <div className="auth-section">
              {user ? (
                <div className="dropdown">
                  <button className="login-btn dropdown-toggle" data-bs-toggle="dropdown">
                    {user.name}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><span className="dropdown-item-text"><strong>Role:</strong> {user.role}</span></li>
                    <li><hr className="dropdown-divider" /></li>
                    {user.role === 'admin' && (
                      <>
                          <li><Link className="dropdown-item" to="/admin/users">Manage Users</Link></li>
    <li><Link className="dropdown-item" to="/create-category">Add Category</Link></li>
    <li><Link className="dropdown-item" to="/create-sub-category">Add Subcategory</Link></li>
    <li><hr className="dropdown-divider" /></li>
                      </>
                    )}
                    {(user.role === 'author' || user.role === 'admin') && (
                      <>
                        <li><Link className="dropdown-item" to="/create-article">Create Article</Link></li>
                        <li><hr className="dropdown-divider" /></li>
                      </>
                    )}
                    <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
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

      {/* Navigation Menu */}
      <nav className="main-nav">
        <div className="d-flex justify-content-center">
          {loading ? (
            <div className="loading-menu">Loading menu...</div>
          ) : (
            <>
              {/* Desktop Menu */}
              <ul className="nav-menu desktop-menu">
                {categories.map((category) => {
                  const categorySubcategories = getSubcategoriesForCategory(category._id);
                  const hasSubcategories = categorySubcategories.length > 0;

                  return (
                    <li 
                      key={category._id} 
                      className={`nav-item ${hasSubcategories ? 'has-dropdown' : ''}`}
                    >
                      <Link to={`/category/${category._id}`} style={{fontWeight: 'bold'}} className="nav-link">
                        {category.name}
                      </Link>
                      
                      {hasSubcategories && (
                        <ul className="dropdown-submenu">
                          {categorySubcategories.map((subcategory) => (
                            <li key={subcategory._id}>
                              <Link 
                              style={{fontWeight: 'bold'}}
                                to={`/subcategory/${subcategory._id}`} 
                                className="submenu-link"
                              >
                                {subcategory.name}
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
                    const categorySubcategories = getSubcategoriesForCategory(category._id);
                    const hasSubcategories = categorySubcategories.length > 0;

                    return (
                      <div key={category._id} className="mobile-nav-item">
                        <Link 
                          to={`/category/${category._id}`} 
                          className="mobile-nav-link"
                          onClick={() => !hasSubcategories && setMobileMenuOpen(false)}
                        >
                          {category.name}
                        </Link>
                        
                        {hasSubcategories && (
                          <div className="mobile-submenu">
                            {categorySubcategories.map((subcategory) => (
                              <Link
                                key={subcategory._id}
                                to={`/subcategory/${subcategory._id}`}
                                className="mobile-submenu-link"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {subcategory.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Mobile Toggle */}
              <div className="mobile-toggle">
                <button 
                  className="mobile-toggle-btn" 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? 'Hide Menu' : 'Show Menu'}
                </button>
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default NavigationBar;