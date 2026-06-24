// src/pages/CategoryPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import productService from '../../services/productService';
import CategoryProductCard from '../../Components/CategoryProductCard';
import Sheet from '../../Components/Sheet';
import Toast from '../../Components/Toast';
import {
  CAMPUS_OPTIONS,
  SUBCATEGORY_MAP,
  SORT_OPTIONS,
} from '../../config/category';

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Get category display name
  const categoryName = category?.replace(/-/g, ' ') || '';

  // Server state
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [total, setTotal] = useState(0);

  // Filter state
  const [sort, setSort] = useState('newest');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('');
  const [page, setPage] = useState(1);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const subcategories = SUBCATEGORY_MAP[category] || [];

  // Focus search input when shown
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [showSearch]);

  // Reset to page 1 and reload when filters/sort change
  useEffect(() => {
    setPage(1);
    setProducts([]);
    fetchProducts(1, false);
  }, [sort, selectedSubcategory, selectedCampus, category]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination?.hasNextPage && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchProducts(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [pagination, loadingMore, loading, page]);

  const fetchProducts = async (pageNum = 1, append = false) => {
    if (!category) return;

    try {
      append ? setLoadingMore(true) : setLoading(true);

      const params = { sort, page: pageNum, limit: 20 };
      if (selectedSubcategory) params.subcategory = selectedSubcategory;
      if (selectedCampus) params.campus = selectedCampus;

      const response = await productService.getProducts({
        ...params,
        category: category,
      });

      if (response.success || response.status === 200) {
        const incoming = response.data?.data || response.data || [];
        setProducts(prev => append ? [...prev, ...incoming] : incoming);
        setPagination(response.pagination);
        setTotal(response.total ?? 0);
      }
    } catch (err) {
      showToastMessage('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const showToastMessage = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() && !recentSearches.includes(text.trim().toLowerCase())) {
      setRecentSearches(prev => [text.trim(), ...prev.slice(0, 4)]);
    }
  };

  const clearSearch = () => setSearchQuery('');

  const handleClearFilters = () => {
    setSelectedSubcategory('');
    setSelectedCampus('');
    setSort('newest');
  };

  // Client-side search filter
  const filteredProducts = searchQuery.trim()
    ? products.filter(p => {
        const q = searchQuery.toLowerCase().trim();
        return (
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.subcategory?.toLowerCase().includes(q) ||
          p.location?.campusArea?.toLowerCase().includes(q) ||
          p.vendor?.name?.toLowerCase().includes(q)
        );
      })
    : products;

  const activeFilterCount = [selectedSubcategory, selectedCampus].filter(Boolean).length;

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-10">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-5">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-extrabold text-green-900 mb-2 capitalize">
          {categoryName}
        </h2>
        <p className="text-sm text-gray-400 text-center">Fetching listings for you…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        onClose={() => setToastVisible(false)}
      />

      {/* ── HERO BANNER ── */}
      <div className="relative h-56 sm:h-64 md:h-72 overflow-hidden bg-green-900">
        <img
          src="https://res.cloudinary.com/duv3qvvjz/image/upload/v1780782982/flyer13_1_fyp0xj.png"
          alt={categoryName}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/25" />

        {/* Nav */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center hover:bg-black/40 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-white">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="text-center">
            <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white drop-shadow-lg capitalize">
              {categoryName}
            </h1>
            {!loading && (
              <p className="text-xs sm:text-sm text-white/70 mt-0.5 font-medium">
                {total} {total === 1 ? 'listing' : 'listings'}
              </p>
            )}
          </div>

          <Link
            to="/cart"
            className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center hover:bg-black/40 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-green-100">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </svg>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
          {showSearch ? (
            <div className="flex items-center bg-white rounded-2xl border-2 border-green-500 shadow-lg overflow-hidden">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 ml-3 sm:ml-4">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder={`Search in ${categoryName}…`}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 px-3 py-3 sm:py-3.5 text-sm outline-none"
                autoCapitalize="none"
              />
              {searchQuery && (
                <button onClick={clearSearch} className="p-2">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => { setShowSearch(false); clearSearch(); }}
                className="bg-green-500 text-white px-4 py-3 sm:py-3.5 font-bold text-sm hover:bg-green-600"
              >
                Done
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="w-full flex items-center gap-2 bg-white rounded-2xl px-4 py-3 sm:py-3.5 shadow-lg text-gray-400 hover:text-gray-600"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 sm:w-5 sm:h-5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <span className="text-sm sm:text-base">Search in {categoryName}…</span>
            </button>
          )}
        </div>
      </div>

      {/* ── RECENT SEARCHES ── */}
      {showSearch && recentSearches.length > 0 && !searchQuery && (
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent</span>
            <button
              onClick={() => setRecentSearches([])}
              className="text-xs font-semibold text-red-500 hover:text-red-600"
            >
              Clear
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {recentSearches.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSearch(s)}
                className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-green-200 hover:bg-green-100 whitespace-nowrap"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── SUBCATEGORY PILLS ── */}
      {subcategories.length > 0 && (
        <div className="bg-white border-b border-gray-100 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-4 py-3">
            <button
              onClick={() => setSelectedSubcategory('')}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border-2 ${
                !selectedSubcategory
                  ? 'bg-green-900 text-white border-green-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              All
            </button>
            {subcategories.map(sub => {
              const active = selectedSubcategory === sub.value;
              return (
                <button
                  key={sub.value}
                  onClick={() => setSelectedSubcategory(active ? '' : sub.value)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border-2 ${
                    active
                      ? 'bg-green-900 text-white border-green-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TOOLBAR ── */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-20">
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-xs sm:text-sm text-gray-400">
            {loading
              ? 'Loading…'
              : searchQuery
                ? `${filteredProducts.length} results for "${searchQuery}"`
                : `${total} listings`}
          </span>

          <div className="flex items-center gap-2">
            {/* Filter button */}
            <button
              onClick={() => setShowFilterSheet(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeFilterCount > 0
                  ? 'bg-green-700 text-white border-green-700'
                  : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path d="M3 6h18M6 12h12M9 18h6" />
              </svg>
              Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>

            {/* Sort button */}
            <button
              onClick={() => setShowSortSheet(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path d="M7 3v18M3 7l4-4 4 4M17 21V3M21 17l-4 4-4-4" />
              </svg>
              {SORT_OPTIONS.find(s => s.id === sort)?.label.split(':')[0].split(' ')[0] || 'Sort'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── ACTIVE FILTER CHIPS ── */}
      {(selectedSubcategory || selectedCampus) && (
        <div className="bg-gray-50 py-2 px-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {selectedSubcategory && (
            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap">
              {subcategories.find(s => s.value === selectedSubcategory)?.label || selectedSubcategory}
              <button onClick={() => setSelectedSubcategory('')}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </span>
          )}
          {selectedCampus && (
            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap">
              {CAMPUS_OPTIONS.find(c => c.value === selectedCampus)?.label || selectedCampus}
              <button onClick={() => setSelectedCampus('')}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </span>
          )}
          <button
            onClick={handleClearFilters}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 whitespace-nowrap"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── SEARCH RESULT BANNER ── */}
      {searchQuery.trim() && (
        <div className="bg-green-50 border-b border-green-100 px-4 py-2.5 flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-green-600 flex-shrink-0">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span className="text-sm text-gray-600 flex-1">
            {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for{' '}
            <span className="font-bold text-green-700">"{searchQuery}"</span>
            {' '}(searching loaded listings)
          </span>
          <button onClick={clearSearch} className="flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400 hover:text-gray-600">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
      )}

      {/* ── PRODUCT GRID ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
        {filteredProducts.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-50 flex items-center justify-center mb-5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-9 h-9 sm:w-10 sm:h-10 text-green-300">
                {searchQuery ? (
                  <>
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </>
                ) : activeFilterCount > 0 ? (
                  <>
                    <path d="M3 6h18M6 12h12M9 18h6" />
                  </>
                ) : (
                  <>
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </>
                )}
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-green-900 mb-2">
              {searchQuery ? 'No results found' : activeFilterCount > 0 ? 'No matches' : 'No listings yet'}
            </h2>
            <p className="text-sm text-gray-400 text-center mb-6 max-w-sm">
              {searchQuery
                ? `Nothing matched "${searchQuery}". Try different keywords.`
                : activeFilterCount > 0
                  ? 'Try removing some filters to see more listings.'
                  : 'Be the first to list something in this category!'}
            </p>
            {(searchQuery || activeFilterCount > 0) && (
              <button
                onClick={() => { clearSearch(); handleClearFilters(); }}
                className="flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 shadow-md transition-all"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M1 4v6h6M23 20v-6h-6" />
                  <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
                </svg>
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {filteredProducts.map(product => (
                <CategoryProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))}
            </div>
          </>
        )}

        {/* Load More Indicator */}
        {loadingMore && (
          <div className="flex justify-center py-6">
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
              <span className="text-sm">Loading more…</span>
            </div>
          </div>
        )}

        {/* End of list */}
        {pagination && !pagination.hasNextPage && products.length > 0 && !loading && (
          <div className="flex items-center gap-4 py-8 px-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
              You've seen all {total} listings
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        )}

        {/* Intersection Observer target */}
        <div ref={loadMoreRef} className="h-4" />

        {/* Bottom Spacer */}
        <div className="h-16 sm:h-20" />
      </div>

      {/* ── SORT SHEET ── */}
      <Sheet isOpen={showSortSheet} onClose={() => setShowSortSheet(false)} title="Sort By">
        <div className="space-y-1">
          {SORT_OPTIONS.map(opt => {
            const active = sort === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => { setSort(opt.id); setShowSortSheet(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                  active ? 'bg-green-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                  active ? 'bg-green-500 text-white' : 'bg-gray-100'
                }`}>
                  {opt.icon}
                </div>
                <span className={`flex-1 text-left text-sm ${
                  active ? 'font-bold text-green-800' : 'font-medium text-gray-700'
                }`}>
                  {opt.label}
                </span>
                {active && (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-500">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </Sheet>

      {/* ── FILTER SHEET ── */}
      <Sheet isOpen={showFilterSheet} onClose={() => setShowFilterSheet(false)} title={
        <div className="flex justify-between items-center w-full">
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <button onClick={handleClearFilters} className="text-sm font-semibold text-red-500 hover:text-red-600">
              Clear all
            </button>
          )}
        </div>
      }>
        <div className="space-y-5">
          {/* Campus Filter */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Campus</h4>
            <div className="flex flex-wrap gap-2">
              {CAMPUS_OPTIONS.map(opt => {
                const active = selectedCampus === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedCampus(active ? '' : opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                      active
                        ? 'bg-green-900 text-white border-green-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subcategory Filter */}
          {subcategories.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Subcategory</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSubcategory('')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                    !selectedSubcategory
                      ? 'bg-green-900 text-white border-green-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  All
                </button>
                {subcategories.map(sub => {
                  const active = selectedSubcategory === sub.value;
                  return (
                    <button
                      key={sub.value}
                      onClick={() => setSelectedSubcategory(active ? '' : sub.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                        active
                          ? 'bg-green-900 text-white border-green-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Apply Button */}
          <button
            onClick={() => setShowFilterSheet(false)}
            className="w-full py-3.5 bg-green-800 text-white rounded-xl font-bold text-sm hover:bg-green-900 transition-colors shadow-md"
          >
            Apply{activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ''}
          </button>
        </div>
      </Sheet>
    </div>
  );
};

export default CategoryPage;