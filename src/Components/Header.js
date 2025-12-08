// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';

const Header = ({ basket }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const itemCount = basket.items.reduce((count, item) => count + item.quantity, 0);

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <span className="logo-icon">🌱</span>
            <div>
              <h1>Freshy Food Factory</h1>
              <p className="tagline">Farm Fresh • Weekly Delivery</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <Link to="/">Home</Link>
            <Link to="/packages">Packages</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/checkout" className="cart-link">
              <FiShoppingCart />
              {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mobile-nav">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/packages" onClick={() => setIsMenuOpen(false)}>Packages</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            <Link to="/checkout" onClick={() => setIsMenuOpen(false)} className="cart-mobile">
              <FiShoppingCart /> Basket ({itemCount})
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;