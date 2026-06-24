// src/pages/GuestProductDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import productService from '../../services/productService';
import ImageGallery from '../../Components/ImageGallery';
import CollapsibleSection from '../../Components/CollapsibleSection';
import InfoGridItem from '../../Components/InfoGridItem';
import StarRating from '../../Components/StarRating';
import {
  CAMPUS_LABELS,
  CONDITION_CONFIG,
  TAG_CONFIG,
  PLACEHOLDER_IMAGE,
} from '../../config/productdetail';

const GuestProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [shareTooltip, setShareTooltip] = useState(false);

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setError('Product not found.');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const res = await productService.getProductById(productId);
      
      if (res?.data?.success || res?.status === 200) {
        const data = res.data?.data?.product || res.data?.data || res.data;
        const related = res.data?.data?.relatedProducts || [];
        const vendorProds = res.data?.data?.vendorProducts || [];
        setProduct(data);
        setRelatedProducts(related);
        setVendorProducts(vendorProds);
      } else {
        setError('Could not load product.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    // Scroll to top when product changes
    window.scrollTo(0, 0);
  }, [productId]);

  const handleShare = async () => {
    const shareData = {
      title: product?.name,
      text: `Check out "${product?.name}" on CediMart — GH₵ ${product?.price?.toFixed(2)}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`
        );
        setShareTooltip(true);
        setTimeout(() => setShareTooltip(false), 2000);
      } catch (err) {
        console.log('Copy failed');
      }
    }
  };

  const handleAddToCart = () => {
    navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
  };

  const handleRelatedProductClick = (item) => {
    const id = item._id || item.id;
    navigate(`/product/${id}`);
  };

  const increaseQty = () => {
    const max = product?.countInStock ?? 99;
    setQuantity(q => Math.min(q + 1, max));
  };

  const decreaseQty = () => {
    setQuantity(q => Math.max(1, q - 1));
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Minimal Nav */}
        <div className="fixed top-0 left-0 right-0 z-20 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-gray-800">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col items-center justify-center min-h-screen px-10">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-500 font-medium">Loading listing…</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed top-0 left-0 right-0 z-20 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-gray-800">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col items-center justify-center min-h-screen px-10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-14 h-14 text-red-500 mb-4">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Listing not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-green-800 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-green-900 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [PLACEHOLDER_IMAGE];
  const conditionInfo = CONDITION_CONFIG[product.condition] || CONDITION_CONFIG['good'];
  const isAvailable = product.isAvailable && (product.countInStock ?? 0) > 0;
  const stockCount = product.countInStock ?? 0;
  const isLowStock = isAvailable && stockCount > 0 && stockCount <= 3;
  const lineTotal = (Number(product.price) * quantity).toFixed(2);

  const infoItems = [
    { icon: 'grid-outline', label: 'Category', value: product.category?.replace(/-/g, ' ') },
    product.subcategory && { icon: 'layers-outline', label: 'Subcategory', value: product.subcategory?.replace(/-/g, ' ') },
    { icon: 'school-outline', label: 'Campus', value: CAMPUS_LABELS[product.campus] || product.campus },
    { icon: 'location-outline', label: 'Area', value: product.location?.campusArea },
    product.location?.hostel && { icon: 'home-outline', label: 'Hostel / Hall', value: product.location.hostel },
    product.brand && { icon: 'bookmark-outline', label: 'Brand', value: product.brand },
    { icon: 'eye-outline', label: 'Views', value: `${product.views ?? 0}` },
    { icon: 'heart-outline', label: 'Saved', value: `${product.favorites ?? 0} people` },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Floating Navigation */}
      <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-gray-800">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="relative">
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-800">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
          
          {/* Share tooltip */}
          {shareTooltip && (
            <div className="absolute top-full right-0 mt-2 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap">
              Link copied!
            </div>
          )}
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative">
        <ImageGallery images={images} />

        {/* Condition Badge */}
        <div
          className="absolute top-16 sm:top-20 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{ backgroundColor: conditionInfo.bg, color: conditionInfo.text }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          {conditionInfo.label}
        </div>

        {/* Negotiable Tag */}
        {product.negotiable && (
          <div className="absolute top-16 sm:top-20 right-4 z-10 flex items-center gap-1.5 bg-orange-500/90 text-white px-3 py-1.5 rounded-full text-xs font-bold">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Negotiable
          </div>
        )}

        {/* Urgent Tag */}
        {product.tags?.includes('urgent-sale') && (
          <div className="absolute top-28 sm:top-32 right-4 z-10 flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Urgent Sale
          </div>
        )}

        {/* Sold Out Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/55 z-10 flex items-center justify-center">
            <div className="text-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 text-white mx-auto mb-2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <p className="text-white text-lg font-extrabold">Sold Out</p>
            </div>
          </div>
        )}
      </div>

      {/* Product Info Panel */}
      <div className="bg-white rounded-t-3xl -mt-6 relative z-10 pb-4">
        {/* Tags */}
        {product.tags?.length > 0 && (
          <div className="flex gap-2 overflow-x-auto px-5 pt-5 pb-2 scrollbar-hide">
            {product.tags.map(tag => {
              const cfg = TAG_CONFIG[tag] || { label: tag, bg: '#F1F8F3', text: '#2E7D32' };
              return (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap"
                  style={{ backgroundColor: cfg.bg, color: cfg.text }}
                >
                  {cfg.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Title Section */}
        <div className="px-5 sm:px-6 pt-3 pb-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-1">
            {product.name}
          </h1>
          {product.brand && (
            <p className="text-sm text-gray-500 font-medium mb-3">by {product.brand}</p>
          )}
          
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="text-2xl sm:text-3xl font-black text-green-900">
              GH₵ {product.price?.toFixed(2)}
            </span>
            {product.negotiable && (
              <span className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-orange-200">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                Negotiable
              </span>
            )}
          </div>

          {(product.numReviews ?? 0) > 0 && (
            <StarRating rating={product.rating || 0} count={product.numReviews || 0} />
          )}
        </div>

        {/* Availability Banner */}
        <div className="mx-5 sm:mx-6 mb-4">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${
            !isAvailable
              ? 'bg-red-50 border-red-200'
              : isLowStock
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-green-50 border-green-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isAvailable ? (isLowStock ? 'bg-orange-500' : 'bg-green-500') : 'bg-red-500'
            }`} />
            <span className={`text-sm font-semibold ${
              !isAvailable
                ? 'text-red-700'
                : isLowStock
                ? 'text-orange-700'
                : 'text-green-700'
            }`}>
              {!isAvailable
                ? 'Currently unavailable'
                : isLowStock
                ? `Only ${stockCount} left — grab it fast!`
                : `${stockCount} in stock`}
            </span>
          </div>
        </div>

        {/* Quantity Selector */}
        {isAvailable && (
          <div className="flex items-center gap-4 px-5 sm:px-6 pb-4">
            <span className="text-sm font-semibold text-gray-600">Quantity</span>
            <div className="flex items-center">
              <button
                onClick={decreaseQty}
                disabled={quantity <= 1}
                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  quantity <= 1
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M5 12h14" />
                </svg>
              </button>
              <span className="text-lg font-bold text-gray-900 mx-3 min-w-[24px] text-center">
                {quantity}
              </span>
              <button
                onClick={increaseQty}
                className="w-9 h-9 rounded-full bg-gray-100 text-green-700 hover:bg-gray-200 flex items-center justify-center"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
            <span className="ml-auto text-lg font-extrabold text-green-900">
              GH₵ {lineTotal}
            </span>
          </div>
        )}

        {/* Product Details - Collapsible */}
        <CollapsibleSection title="Product Details" defaultOpen>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {infoItems.map((item, i) => (
              <InfoGridItem
                key={i}
                icon={item.icon}
                label={item.label}
                value={item.value}
              />
            ))}
          </div>
        </CollapsibleSection>

        {/* Description */}
        {product.description && (
          <CollapsibleSection title="Description" defaultOpen>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </CollapsibleSection>
        )}

        {/* Seller Info */}
        {product.vendor && (
          <CollapsibleSection title="Seller" defaultOpen>
            <Link
              to={`/vendor/${product.vendor._id}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-100 flex items-center justify-center text-green-800 text-xl font-extrabold flex-shrink-0">
                {(product.vendor.name || 'S').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-bold text-gray-900">
                  {product.vendor.name || 'Student Seller'}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  {CAMPUS_LABELS[product.campus] || product.campus}
                </p>
              </div>
              <span className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-200 hover:bg-green-100">
                View Shop
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </CollapsibleSection>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-gray-100 pt-5 mt-2">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 px-5 sm:px-6 mb-4">
              Similar Listings
            </h3>
            <div className="flex gap-3 overflow-x-auto px-5 sm:px-6 pb-2 scrollbar-hide">
              {relatedProducts.map(item => {
                const id = item._id || item.id;
                return (
                  <button
                    key={id}
                    onClick={() => handleRelatedProductClick(item)}
                    className="w-36 sm:w-40 flex-shrink-0 bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="h-24 sm:h-28 overflow-hidden">
                      <img
                        src={item.images?.[0] || item.image || PLACEHOLDER_IMAGE}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-2.5 text-left">
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 mb-1">
                        {item.name}
                      </p>
                      <p className="text-sm sm:text-base font-extrabold text-green-700">
                        GH₵ {Number(item.price).toFixed(2)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Vendor Products */}
        {vendorProducts.length > 0 && (
          <div className="border-t border-gray-100 pt-5 mt-2">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 px-5 sm:px-6 mb-4">
              More from this seller
            </h3>
            <div className="flex gap-3 overflow-x-auto px-5 sm:px-6 pb-2 scrollbar-hide">
              {vendorProducts.map(item => {
                const id = item._id || item.id;
                return (
                  <button
                    key={id}
                    onClick={() => handleRelatedProductClick(item)}
                    className="w-36 sm:w-40 flex-shrink-0 bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="h-24 sm:h-28 overflow-hidden">
                      <img
                        src={item.images?.[0] || item.image || PLACEHOLDER_IMAGE}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-2.5 text-left">
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 mb-1">
                        {item.name}
                      </p>
                      <p className="text-sm sm:text-base font-extrabold text-green-700">
                        GH₵ {Number(item.price).toFixed(2)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Guest Notice */}
        <div className="mx-5 sm:mx-6 mt-5">
          <div className="flex items-start gap-3 bg-blue-50 rounded-2xl p-4 border border-blue-200">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="text-sm text-blue-700">
              <span className="font-bold">Browsing as guest.</span>{' '}
              Sign in to add items to your cart, save favorites, and more.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20 px-4 sm:px-6 py-3">
        <button
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className={`w-full py-3.5 sm:py-4 rounded-2xl flex items-center justify-center gap-2 font-extrabold text-sm sm:text-base transition-all ${
            isAvailable
              ? 'bg-green-900 text-white hover:bg-green-800 shadow-lg shadow-green-900/25'
              : 'bg-green-200 text-green-400 cursor-not-allowed'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
          </svg>
          {isAvailable ? `Add to Cart · GH₵ ${lineTotal}` : 'Sold Out'}
        </button>
      </div>
    </div>
  );
};

export default GuestProductDetail;