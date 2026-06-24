// src/pages/GuestHome.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import HeroCarousel from '../../Components/HeroCarousel';
import StatsBanner from '../../Components/StatsBanner';
import ProductCard from '../../Components/ProductCard';
import DealCard from '../../Components/DealCard';
import CategoryPills from '../../Components/CategoryPills';
import SectionHeader from '../../Components/SectionHeader';
import SellBanner from '../../Components/SellBanner';
import SearchDropdown from '../../Components/SearchDropdown';
import { HERO_SLIDES } from '../../config/cedimart';

const GuestHome = () => {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // State
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [urgentSales, setUrgentSales] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [studentFavorites, setStudentFavorites] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searching, setSearching] = useState(false);

  // Load data
  const loadHomeData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([loadProductData()]);
    } catch (err) {
      console.error('GuestHome load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProductData = async () => {
    try {
      const [featuredRes, urgentRes, popularRes, newRes, favRes] = await Promise.all([
        productService.getProductByTag('featured'),
        productService.getProductByTag('urgent-sale'),
        productService.getProductByTag('popular'),
        productService.getProductByTag('new-arrival'),
        productService.getProductByTag('student-favorite'),
      ]);

      if (featuredRes?.data) setFeaturedProducts(Array.isArray(featuredRes.data) ? featuredRes.data : featuredRes.data?.data || []);
      if (urgentRes?.data) setUrgentSales(Array.isArray(urgentRes.data) ? urgentRes.data : urgentRes.data?.data || []);
      if (popularRes?.data) setPopularProducts(Array.isArray(popularRes.data) ? popularRes.data : popularRes.data?.data || []);
      if (newRes?.data) setNewArrivals(Array.isArray(newRes.data) ? newRes.data : newRes.data?.data || []);
      if (favRes?.data) setStudentFavorites(Array.isArray(favRes.data) ? favRes.data : favRes.data?.data || []);
    } catch (err) {
      console.error('Product data error:', err);
    }
  };

  

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  // Search
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

  // Click outside to close search
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async () => {
    setSearching(true);
    try {
      const res = await productService.searchProducts(searchQuery.trim());
      setSearchResults(res.data || []);
      setShowSearchDropdown(true);
    } catch {
      setSearchResults([]);
    }
    setSearching(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      clearSearch();
    }
  };

  // Handlers
  const handleSlidePress = (slide) => {
    const params = slide.nav.params || '';
    navigate(`${slide.nav.path}${params}`);
  };

  const handleProductPress = (product) => {
    navigate(`/product/${product._id}`);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2EE] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-green-200 border-t-green-700 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-gray-500">Loading CediMart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2EE] overflow-x-hidden">
      {/* Header Section */}
      <div className="bg-green-900 rounded-b-2xl sm:rounded-b-3xl px-4 sm:px-6 pt-6 pb-6 sm:pb-8 relative z-40 mb-8 mx-auto">
        <div className="max-w-7xl ">
          {/* Top Row */}
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <div>
              <p className="text-[11px] sm:text-xs text-green-400 font-bold uppercase tracking-wider mb-1">
                Welcome to
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                CediMart
              </h1>
              <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-300"></div>
                <span className="text-[11px] sm:text-xs text-green-100 font-medium">
                  Ghana's Campus Marketplace
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate('/login')}
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full border-2 border-white/35 text-white text-xs sm:text-sm font-bold hover:bg-white/10 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="flex items-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-yellow-400 text-green-900 text-xs sm:text-sm font-extrabold hover:bg-yellow-300 transition-colors"
              >
                Join Free
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 sm:w-3.5 sm:h-3.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 sm:py-3.5 shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search products, categories…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-sm sm:text-base text-gray-800 placeholder-gray-400 bg-transparent"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
                {searching ? (
                  <div className="w-4 h-4 border-2 border-green-200 border-t-green-700 rounded-full animate-spin flex-shrink-0"></div>
                ) : searchQuery.length > 0 ? (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/products')}
                    className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-700 hover:bg-green-100 flex-shrink-0"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                      <path d="M3 6h18M3 12h18M3 18h18" />
                    </svg>
                  </button>
                )}
              </div>
            </form>

            {/* Search Dropdown */}
            {showSearchDropdown && (
              <SearchDropdown
                results={searchResults}
                searching={searching}
                searchQuery={searchQuery}
                onClose={() => setShowSearchDropdown(false)}
                onViewAll={() => {
                  handleSearchSubmit({ preventDefault: () => {} });
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-2 relative z-30">
        {/* Hero Carousel */}
        <div className="mb-4">
          <HeroCarousel slides={HERO_SLIDES} onSlidePress={handleSlidePress} />
        </div>

        
        {/* Categories */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4">
          <SectionHeader title="Browse by Category" />
          <CategoryPills />
        </div>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4">
            <SectionHeader
              title="Featured Listings"
              subtitle="Hand-picked by our team"
              linkTo="/products?tag=featured"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {featuredProducts.slice(0, 10).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Urgent Sales */}
        {urgentSales.length > 0 && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4">
            <SectionHeader
              title="Urgent Sales"
              subtitle="Grab them before they're gone"
              linkTo="/products?tag=urgent-sale"
              urgent
            />
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {urgentSales.map((product) => (
                <DealCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Popular on Campus */}
        {popularProducts.length > 0 && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4">
            <SectionHeader
              title="Popular on Campus"
              subtitle="Most viewed this week"
              linkTo="/products?tag=popular&sort=popular"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {popularProducts.slice(0, 10).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4">
            <SectionHeader
              title="New Arrivals"
              subtitle="Just listed by students"
              linkTo="/products?tag=new-arrival&sort=newest"
            />
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {newArrivals.map((product) => (
                <DealCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Student Favorites */}
        {studentFavorites.length > 0 && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4">
            <SectionHeader
              title="Student Favorites"
              subtitle="Loved by campus shoppers"
              linkTo="/products?tag=student-favorite"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {studentFavorites.slice(0, 10).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Sell Banner */}
        <div className="mb-4">
          <SellBanner />
        </div>

        {/* Bottom Spacer */}
        <div className="h-16 sm:h-20" />
      </div>
    </div>
  );
};

export default GuestHome;