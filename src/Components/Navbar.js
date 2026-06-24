// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        performSearch();
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async () => {
    setSearching(true);
    try {
      // Using the same API as the mobile app
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/products?search=${encodeURIComponent(searchQuery.trim())}&limit=8`
      );
      const data = await response.json();
      setSearchResults(data.data || []);
      setShowSearchDropdown(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
    setSearching(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setShowSearchDropdown(false);
      setSearchQuery('');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  const CATEGORY_CONFIG = {
    electronics: { icon: '🔌', label: 'Electronics', color: '#E3F2FD', accent: '#1565C0' },
    'phones and tablets': { icon: '📱', label: 'Phones & Tablets', color: '#F3E5F5', accent: '#6A1B9A' },
    'computers and laptops': { icon: '💻', label: 'Computers & Laptops', color: '#E8EAF6', accent: '#283593' },
    gaming: { icon: '🎮', label: 'Gaming', color: '#FCE4EC', accent: '#880E4F' },
    fashion: { icon: '👗', label: 'Fashion', color: '#FFF3E0', accent: '#E65100' },
    'books-course-materials': { icon: '📚', label: 'Books', color: '#FFF9C4', accent: '#F57F17' },
    'hostel-items': { icon: '🛏️', label: 'Hostel Items', color: '#E8F5E9', accent: '#2E7D32' },
    appliances: { icon: '🔧', label: 'Appliances', color: '#EFEBE9', accent: '#4E342E' },
    furniture: { icon: '🪑', label: 'Furniture', color: '#F1F8E9', accent: '#33691E' },
    'beauty and grooming': { icon: '💄', label: 'Beauty', color: '#FCE4EC', accent: '#AD1457' },
    'sports and fitness': { icon: '⚽', label: 'Sports', color: '#E8F5E9', accent: '#1B5E20' },
    accessories: { icon: '👜', label: 'Accessories', color: '#FFF9C4', accent: '#827717' },
    'food and drinks': { icon: '🍱', label: 'Food', color: '#FBE9E7', accent: '#BF360C' },
    services: { icon: '🛠️', label: 'Services', color: '#E3F2FD', accent: '#01579B' },
    other: { icon: '📦', label: 'Other', color: '#F5F5F5', accent: '#616161' },
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🛒</span>
          <span className="logo-text">CediMart</span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="navbar-search" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search products, categories…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoCapitalize="none"
                autoCorrect="off"
              />
              {searching ? (
                <div className="search-spinner"></div>
              ) : searchQuery.length > 0 ? (
                <button type="button" onClick={clearSearch} className="search-clear-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              ) : null}
            </div>
          </form>

          {/* Search Dropdown */}
          {showSearchDropdown && (
            <div className="search-dropdown">
              {searchResults.length > 0 ? (
                <>
                  <div className="search-results-label">Products</div>
                  {searchResults.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      className="search-result-item"
                      onClick={() => {
                        setShowSearchDropdown(false);
                        setSearchQuery('');
                      }}
                    >
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="search-result-img" />
                      ) : (
                        <div className="search-result-placeholder">
                          {CATEGORY_CONFIG[product.category]?.icon || '📦'}
                        </div>
                      )}
                      <div className="search-result-info">
                        <span className="search-result-name">{product.name}</span>
                        <div className="search-result-meta">
                          <span className="search-result-price">GH₵ {product.price?.toFixed(2)}</span>
                          {product.campus && (
                            <span className="search-result-campus">{product.campus}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
                    className="search-view-all"
                  >
                    See all results for "{searchQuery}"
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              ) : !searching ? (
                <div className="search-no-results">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <span>No results</span>
                  <small>Try a different keyword</small>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Navigation Links - Desktop */}
        <div className="navbar-links">
          <Link to="/products" className="nav-link">Browse All</Link>
          <Link to="/products?tag=featured" className="nav-link">Featured</Link>
          <Link to="/products?tag=urgent-sale" className="nav-link nav-link-urgent">Urgent Sales</Link>
        </div>

        {/* Auth Buttons - Desktop */}
        <div className="navbar-auth">
          <Link to="/login" className="btn-signin">Sign In</Link>
          <Link to="/signup" className="btn-signup">
            Join Free
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
            {mobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <path d="M3 12h18M3 6h18M3 18h18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <form onSubmit={handleSearchSubmit} className="mobile-search-form">
            <div className="search-input-wrapper mobile-search-input">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search products…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </form>
          <Link to="/products" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Browse All</Link>
          <Link to="/products?tag=featured" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Featured</Link>
          <Link to="/products?tag=urgent-sale" className="mobile-nav-link mobile-nav-urgent" onClick={() => setMobileMenuOpen(false)}>Urgent Sales</Link>
          <div className="mobile-auth">
            <Link to="/login" className="btn-signin mobile-btn-signin" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
            <Link to="/signup" className="btn-signup mobile-btn-signup" onClick={() => setMobileMenuOpen(false)}>Join Free</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;