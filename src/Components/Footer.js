// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>Freshy Food Factory</h3>
            <p>Farm-fresh vegetables, fruits, and staples delivered weekly to your home.</p>
            <p className="copyright">
              © {new Date().getFullYear()} Fresh Harvest Basket. All rights reserved.
            </p>
          </div>

          <div className="footer-links">
            <div className="links-column">
              <h4>Quick Links</h4>
              <Link to="/">Home</Link>
              <Link to="/packages">Packages</Link>
              <Link to="/contact">Contact</Link>
            </div>
            <div className="links-column">
              <h4>Information</h4>
              <Link to="/how-it-works">How It Works</Link>
              <Link to="/faq">FAQ</Link>
              <Link to="/farmers">Our Farmers</Link>
            </div>
            <div className="links-column">
              <h4>Contact</h4>
              <p>📍 City Delivery Area</p>
              <p>📞 0800-FRESH-FOOD</p>
              <p>✉️ hello@freshharvest.com</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;