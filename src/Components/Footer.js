// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-icon">🛒</span>
              <span className="footer-logo-text">CediMart</span>
            </div>
            <p className="footer-description">
              Ghana's #1 campus marketplace. Buy and sell with students across universities in Ghana.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h4 className="footer-column-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/products">Browse All Products</Link></li>
              <li><Link to="/products?tag=featured">Featured Listings</Link></li>
              <li><Link to="/products?tag=urgent-sale">Urgent Sales</Link></li>
              <li><Link to="/products?tag=new-arrival">New Arrivals</Link></li>
              <li><Link to="/products?sort=popular">Popular Items</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-column">
            <h4 className="footer-column-title">Top Categories</h4>
            <ul className="footer-links">
              <li><Link to="/products?category=electronics">Electronics</Link></li>
              <li><Link to="/products?category=phones%20and%20tablets">Phones & Tablets</Link></li>
              <li><Link to="/products?category=computers%20and%20laptops">Computers & Laptops</Link></li>
              <li><Link to="/products?category=fashion">Fashion</Link></li>
              <li><Link to="/products?category=hostel-items">Hostel Essentials</Link></li>
            </ul>
          </div>

          {/* For Users */}
          <div className="footer-column">
            <h4 className="footer-column-title">For You</h4>
            <ul className="footer-links">
              <li><Link to="/signup">Create Account</Link></li>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/vendor-signup">Start Selling</Link></li>
              <li><Link to="/safety-tips">Safety Tips</Link></li>
              <li><Link to="/about">About CediMart</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} CediMart. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <span className="footer-divider">|</span>
            <Link to="/terms">Terms of Service</Link>
            <span className="footer-divider">|</span>
            <Link to="/contact">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;