// src/pages/ProductsPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import productService from '../../services/productService';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import GridProductCard from '../../Components/GridProductCard';
import ListProductCard from '../../Components/ListProductCard';
import ConditionBadge from '../../Components/ConditionBadge';
import Sheet from '../../Components/Sheet';
import Toast from '../../Components/Toast';
import {
  CATEGORIES,
  SUBCATEGORIES,
  CONDITION_CONFIG,
  SORT_OPTIONS,
  CAMPUS_OPTIONS,
  HERO_IMAGES,
} from '../../config/products';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { addToCart, updateQuantity, removeFromCart, cartCount, cartItems } = useCart();

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [pagination, setPagination] = useState({});

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedCampus, setSelectedCampus] = useState(searchParams.get('campus') || '');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'newest');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [negotiableOnly, setNegotiableOnly] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Search
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showSearch, setShowSearch] = useState(!!searchParams.get('search'));
  const [liveSearchResults, setLiveSearchResults] = useState([]);
  const [liveSearching, setLiveSearching] = useState(false);
  const [showLiveDropdown, setShowLiveDropdown] = useState(false);

  // UI
  const [viewMode, setViewMode] = useState('grid');
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [campusSheetOpen, setCampusSheetOpen] = useState(false);
  const [addingProductId, setAddingProductId] = useState(null);
  const [updatingProductId, setUpdatingProductId] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [addedProductName, setAddedProductName] = useState('');

  const searchInputRef = useRef(null);
  const fetchIdRef = useRef(0);
  const searchTimerRef = useRef(null);

  // Initialize from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const campus = searchParams.get('campus');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');

    if (category) setSelectedCategory(category);
    if (campus) setSelectedCampus(campus);
    if (search) {
      setSearchQuery(search);
      setShowSearch(true);
    }
    if (sort) setSelectedSort(sort);
  }, []);

  // Fetch products
  const buildParams = useCallback((overrides = {}) => {
    const base = {
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      subcategory: selectedSubcategory || undefined,
      campus: selectedCampus || undefined,
      sort: selectedSort,
      condition: selectedCondition || undefined,
      negotiable: negotiableOnly || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      search: searchQuery.trim() || undefined,
      limit: 20,
    };
    // Remove undefined values
    const cleaned = {};
    Object.entries({ ...base, ...overrides }).forEach(([key, value]) => {
      if (value !== undefined && value !== '') cleaned[key] = value;
    });
    return cleaned;
  }, [selectedCategory, selectedSubcategory, selectedCampus, selectedSort, selectedCondition, negotiableOnly, minPrice, maxPrice, searchQuery]);

  const loadProducts = useCallback(async ({ page = 1, append = false } = {}) => {
    fetchIdRef.current += 1;
    const myId = fetchIdRef.current;

    if (!append) setLoading(true);

    try {
      const params = buildParams({ page });
      const res = await productService.getProducts(params);

      if (myId !== fetchIdRef.current) return;

      if (res?.success) {
        setProducts(append ? (prev) => [...prev, ...(res.data || [])] : (res.data || []));
        setTotalProducts(res.total || 0);
        setPagination(res.pagination || {});
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Load products error:', err);
    } finally {
      if (myId !== fetchIdRef.current) return;
      setLoading(false);
    }
  }, [buildParams]);

  // Initial load and reload on filter changes
  useEffect(() => {
    loadProducts({ page: 1 });
  }, [loadProducts]);

  // Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubcategory('');
  }, [selectedCategory]);

  // Live search debounce
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    
    searchTimerRef.current = setTimeout(() => {
      if (searchQuery.trim().length >= 2 && showSearch) {
        performLiveSearch();
      } else {
        setLiveSearchResults([]);
        setShowLiveDropdown(false);
      }
    }, 350);

    return () => clearTimeout(searchTimerRef.current);
  }, [searchQuery, showSearch]);

  const performLiveSearch = async () => {
    setLiveSearching(true);
    try {
      const res = await productService.searchProducts(searchQuery.trim(), 6);
      setLiveSearchResults(res?.data || []);
      setShowLiveDropdown(true);
    } catch {
      setLiveSearchResults([]);
    } finally {
      setLiveSearching(false);
    }
  };

  const handleSearchSubmit = () => {
    setShowLiveDropdown(false);
    loadProducts({ page: 1 });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setLiveSearchResults([]);
    setShowLiveDropdown(false);
    loadProducts({ page: 1 });
  };

  // Cart helpers
  const getQtyInCart = (productId) => {
    const item = cartItems?.find(i => i.product?._id === productId || i.productId === productId);
    return item?.quantity ?? 0;
  };

  const showToast = (name) => {
    setAddedProductName(name);
    setToastVisible(true);
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      if (window.confirm('Please log in to save items.\n\nClick OK to go to login.')) {
        navigate('/login');
      }
      return;
    }
    if ((product.countInStock ?? 0) <= 0) {
      alert(`${product.name} is no longer available.`);
      return;
    }
    try {
      setAddingProductId(product._id);
      await addToCart(product._id, 1);
      showToast(product.name);
    } catch {
      alert('Could not add item. Please try again.');
    } finally {
      setAddingProductId(null);
    }
  };

  const handleQtyChange = async (product, action) => {
    const productId = product._id;
    const qty = getQtyInCart(productId);
    try {
      if (action === 'increase') {
        if (qty >= (product.countInStock ?? 0)) {
          alert(`Only ${product.countInStock} unit(s) available.`);
          return;
        }
        setUpdatingProductId(productId);
        await addToCart(productId, 1);
      } else if (action === 'decrease' && qty > 1) {
        setUpdatingProductId(productId);
        await updateQuantity(productId, qty - 1);
      } else if (action === 'decrease' && qty === 1) {
        if (window.confirm(`Remove ${product.name} from cart?`)) {
          setUpdatingProductId(productId);
          await removeFromCart(productId);
        }
        return;
      }
    } catch {
      alert('Could not update cart.');
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleLoadMore = () => {
    if (!loading && pagination.hasNextPage) {
      loadProducts({ page: currentPage + 1, append: true });
    }
  };

  // Computed
  const activeCatConfig = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];
  const subcatsForCat = SUBCATEGORIES[selectedCategory] || [];
  const heroImage = HERO_IMAGES[selectedCategory] || HERO_IMAGES.all;
  const activeSortLabel = SORT_OPTIONS.find(s => s.id === selectedSort)?.label || 'Sort';

  const activeFilterCount = [
    selectedCampus,
    selectedCondition,
    negotiableOnly,
    minPrice,
    maxPrice,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('');
    setSelectedCampus('');
    setSelectedSort('newest');
    setSelectedCondition('');
    setNegotiableOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    setShowSearch(false);
    loadProducts({ page: 1 });
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Toast */}
      <Toast
        visible={toastVisible}
        productName={addedProductName}
        onClose={() => setToastVisible(false)}
      />

      {/* Sort Sheet */}
      <Sheet isOpen={sortSheetOpen} onClose={() => setSortSheetOpen(false)} title="Sort Listings">
        <div className="space-y-1">
          {SORT_OPTIONS.map(opt => {
            const isActive = selectedSort === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => { setSelectedSort(opt.id); setSortSheetOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-green-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                  isActive ? 'bg-green-500 text-white' : 'bg-gray-100'
                }`}>
                  {opt.icon}
                </div>
                <span className={`flex-1 text-left text-sm ${
                  isActive ? 'font-bold text-green-800' : 'font-medium text-gray-700'
                }`}>
                  {opt.label}
                </span>
                {isActive && (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-500">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </Sheet>

      {/* Campus Sheet */}
      <Sheet isOpen={campusSheetOpen} onClose={() => setCampusSheetOpen(false)} title="Filter by Campus">
        <div className="space-y-1">
          {CAMPUS_OPTIONS.map(opt => {
            const isActive = selectedCampus === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => { setSelectedCampus(opt.id); setCampusSheetOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-green-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive ? 'bg-green-500' : 'bg-gray-100'
                }`}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3z"/>
                  </svg>
                </div>
                <span className={`flex-1 text-left text-sm ${
                  isActive ? 'font-bold text-green-800' : 'font-medium text-gray-700'
                }`}>
                  {opt.label}
                </span>
                {isActive && (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-500">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </Sheet>

      {/* Advanced Filter Sheet */}
      <Sheet isOpen={filterSheetOpen} onClose={() => setFilterSheetOpen(false)} title="Advanced Filters">
        <div className="space-y-5">
          {/* Condition */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3">Condition</h4>
            <div className="flex flex-wrap gap-2">
              {[{ id: '', label: 'Any' }, ...Object.entries(CONDITION_CONFIG).map(([k, v]) => ({ id: k, label: v.label }))].map(opt => {
                const isActive = selectedCondition === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedCondition(opt.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      isActive
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3">Price Range (GH₵)</h4>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-400 font-semibold mb-1 block">Min</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                />
              </div>
              <div className="w-4 h-0.5 bg-gray-300 mt-5" />
              <div className="flex-1">
                <label className="text-xs text-gray-400 font-semibold mb-1 block">Max</label>
                <input
                  type="number"
                  placeholder="Any"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                />
              </div>
            </div>
          </div>

          {/* Negotiable Toggle */}
          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div>
              <h4 className="text-sm font-bold text-gray-700">Negotiable Only</h4>
              <p className="text-xs text-gray-400 mt-0.5">Show listings open to price discussion</p>
            </div>
            <button
              onClick={() => setNegotiableOnly(!negotiableOnly)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                negotiableOnly ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  negotiableOnly ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {/* Apply Button */}
          <button
            onClick={() => { setFilterSheetOpen(false); loadProducts({ page: 1 }); }}
            className="w-full py-3.5 bg-green-800 text-white rounded-xl font-bold text-sm hover:bg-green-900 transition-colors"
          >
            Apply Filters
          </button>

          {/* Clear */}
          {(selectedCondition || negotiableOnly || minPrice || maxPrice) && (
            <button
              onClick={() => {
                setSelectedCondition('');
                setNegotiableOnly(false);
                setMinPrice('');
                setMaxPrice('');
              }}
              className="w-full py-2 text-sm text-gray-400 font-semibold hover:text-gray-600"
            >
              Clear Advanced Filters
            </button>
          )}
        </div>
      </Sheet>

      {/* ── HERO BANNER ── */}
      <div className="relative h-56 sm:h-64 md:h-72 lg:h-80 overflow-hidden bg-green-900">
        <img
          src={heroImage}
          alt={activeCatConfig.label}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/30" />
        
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
            <span className="text-2xl sm:text-3xl block mb-1">{activeCatConfig.emoji}</span>
            <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white drop-shadow-lg">
              {activeCatConfig.id === 'all' ? 'All Listings' : activeCatConfig.label}
            </h1>
            {!loading && (
              <p className="text-xs sm:text-sm text-white/70 mt-0.5 font-medium">
                {totalProducts.toLocaleString()} item{totalProducts !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <Link
            to="/cart"
            className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center hover:bg-black/40 transition-colors relative"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-white">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-black/30">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Search Bar */}
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 z-10">
          {showSearch ? (
            <div className="flex items-center bg-white rounded-2xl border-2 border-green-500 shadow-lg overflow-hidden">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 ml-3 sm:ml-4">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search listings…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                className="flex-1 px-3 py-3 sm:py-3.5 text-sm outline-none"
                autoFocus
              />
              <button
                onClick={handleSearchSubmit}
                className="bg-green-500 text-white px-4 py-3 sm:py-3.5 font-bold text-sm hover:bg-green-600"
              >
                Go
              </button>
              <button
                onClick={() => { setShowSearch(false); clearSearch(); }}
                className="p-3 text-gray-400 hover:text-gray-600"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
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
              <span className="text-sm sm:text-base flex-1 text-left">
                {searchQuery || 'Search listings, brands…'}
              </span>
              {searchQuery && (
                <button onClick={(e) => { e.stopPropagation(); clearSearch(); }} className="p-1">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              )}
            </button>
          )}

          {/* Live Search Dropdown */}
          {showLiveDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-40 max-h-80 overflow-y-auto">
              {liveSearching ? (
                <div className="p-6 text-center">
                  <div className="w-5 h-5 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
                </div>
              ) : liveSearchResults.length > 0 ? (
                <>
                  {liveSearchResults.map(p => {
                    const catCfg = CATEGORIES.find(c => c.id === p.category) || CATEGORIES[CATEGORIES.length - 1];
                    return (
                      <Link
                        key={p._id}
                        to={`/product/${p._id}`}
                        onClick={() => setShowLiveDropdown(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                      >
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-11 h-11 rounded-xl object-cover" />
                        ) : (
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: catCfg.color }}>
                            {catCfg.emoji}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-green-700">GH₵ {p.price?.toFixed(2)}</span>
                            {p.campus && (
                              <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{p.campus}</span>
                            )}
                          </div>
                        </div>
                        {p.condition && <ConditionBadge condition={p.condition} />}
                      </Link>
                    );
                  })}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-green-700 hover:bg-green-50 border-t border-gray-50"
                  >
                    See all results for "{searchQuery}"
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              ) : (
                <div className="p-6 text-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-gray-300 mx-auto mb-2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <p className="text-sm text-gray-400">No results found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── CATEGORY TABS ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-16 z-30">
        <div className="flex gap-1.5 overflow-x-auto px-3 py-2.5 scrollbar-hide">
          {CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                disabled={loading}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={isActive ? { backgroundColor: cat.accent } : {}}
              >
                <span className="text-sm">{cat.emoji}</span>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SUBCATEGORIES ── */}
      {subcatsForCat.length > 0 && (
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="flex gap-1.5 overflow-x-auto px-4 py-2 scrollbar-hide">
            <button
              onClick={() => setSelectedSubcategory('')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSubcategory === ''
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              All
            </button>
            {subcatsForCat.map(sub => {
              const isActive = selectedSubcategory === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategory(isActive ? '' : sub.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
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
      <div className="bg-white border-b border-gray-100 sticky top-[calc(64px+52px)] z-20">
        <div className="flex items-center justify-between px-4 py-2.5 gap-3">
          {/* Left */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {loading ? (
              <div className="w-4 h-4 border-2 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            ) : (
              <p className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
                <span className="font-extrabold text-gray-800">{totalProducts}</span> listings
              </p>
            )}
            {searchQuery && (
              <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg text-xs font-semibold truncate">
                <span className="truncate">"{searchQuery}"</span>
                <button onClick={clearSearch} className="flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Right - Toolbar Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Campus */}
            <button
              onClick={() => setCampusSheetOpen(true)}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedCampus
                  ? 'bg-green-700 text-white border-green-700'
                  : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3z"/>
              </svg>
              <span className="hidden sm:inline">{selectedCampus || 'Campus'}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Sort */}
            <button
              onClick={() => setSortSheetOpen(true)}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                <path d="M7 3v18M3 7l4-4 4 4M17 21V3M21 17l-4 4-4-4" />
              </svg>
              <span className="hidden sm:inline">{activeSortLabel.split(':')[0].split('→')[0].trim()}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Filter */}
            <button
              onClick={() => setFilterSheetOpen(true)}
              className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center border transition-all ${
                activeFilterCount > 0
                  ? 'bg-green-700 border-green-700 text-white'
                  : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M3 6h18M6 12h12M9 18h6" />
              </svg>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : ''
                }`}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className={`w-3.5 h-3.5 ${viewMode === 'grid' ? 'text-green-700' : 'text-gray-400'}`}>
                  <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : ''
                }`}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className={`w-3.5 h-3.5 ${viewMode === 'list' ? 'text-green-700' : 'text-gray-400'}`}>
                  <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(selectedCampus || selectedCondition || negotiableOnly || minPrice || maxPrice) && (
        <div className="bg-white border-b border-gray-100 py-2">
          <div className="flex gap-1.5 overflow-x-auto px-4 scrollbar-hide">
            {selectedCampus && (
              <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap">
                {selectedCampus}
                <button onClick={() => setSelectedCampus('')}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </span>
            )}
            {selectedCondition && (
              <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap">
                {CONDITION_CONFIG[selectedCondition]?.label}
                <button onClick={() => setSelectedCondition('')}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </span>
            )}
            {negotiableOnly && (
              <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap">
                Negotiable
                <button onClick={() => setNegotiableOnly(false)}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap">
                GH₵{minPrice || '0'} – {maxPrice || '∞'}
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); }}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── PRODUCTS ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
        {loading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-400">Finding listings…</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-50 flex items-center justify-center mb-5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-9 h-9 sm:w-10 sm:h-10 text-green-300">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-green-900 mb-2">No listings found</h2>
            <p className="text-sm text-gray-400 text-center mb-6 max-w-sm">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : selectedCategory !== 'all'
                  ? `Nothing in ${activeCatConfig.label} yet`
                  : 'Try adjusting your filters'}
            </p>
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 shadow-md transition-all"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path d="M1 4v6h6M23 20v-6h-6" />
                <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
              </svg>
              Clear All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {products.map(product => (
                <GridProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onQtyChange={handleQtyChange}
                  qtyInCart={getQtyInCart(product._id)}
                  isAdding={addingProductId === product._id}
                  isUpdating={updatingProductId === product._id}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {products.map(product => (
              <ListProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                onQtyChange={handleQtyChange}
                qtyInCart={getQtyInCart(product._id)}
                isAdding={addingProductId === product._id}
                isUpdating={updatingProductId === product._id}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {!loading && pagination.hasNextPage && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-xl font-bold text-sm border-2 border-green-200 hover:bg-green-100 transition-all"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path d="M6 9l6 6 6-6" />
              </svg>
              Load More Listings
            </button>
          </div>
        )}

        {/* Loading More */}
        {loading && products.length > 0 && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Bottom Spacer */}
        <div className="h-16 sm:h-20" />
      </div>
    </div>
  );
};

export default ProductsPage;