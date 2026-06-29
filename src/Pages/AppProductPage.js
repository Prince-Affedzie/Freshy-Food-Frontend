// src/pages/ProductPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import productService from '../services/productService';

// ─── Constants ────────────────────────────────────────────────────────────────

const CONDITION_LABELS = {
  'new':           { label: 'Brand New',    color: '#1A5C1A', bg: '#E6F4E6' },
  'like-new':      { label: 'Like New',     color: '#1A5C1A', bg: '#E6F4E6' },
  'excellent':     { label: 'Excellent',    color: '#1040A0', bg: '#E3EDFF' },
  'good':          { label: 'Good',         color: '#8A5800', bg: '#FFF5E0' },
  'fair':          { label: 'Fair',         color: '#B84000', bg: '#FFF0E6' },
  'slightly-used': { label: 'Slightly Used',color: '#B84000', bg: '#FFF0E6' },
  'for-parts':     { label: 'For Parts',    color: '#9E0000', bg: '#FFEBEB' },
};

const CAMPUS_LABELS = {
  UG:     'University of Ghana',
  KNUST:  'KNUST',
  UCC:    'University of Cape Coast',
  UEW:    'University of Education, Winneba',
  UPSA:   'UPSA',
  GIMPA:  'GIMPA',
  ASHESI: 'Ashesi University',
  ATU:    'Accra Technical University',
  OTHER:  'Other',
};

// ─── Helper: star rating ──────────────────────────────────────────────────────
const Stars = ({ rating = 0, count = 0 }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={s.starsWrap}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= full ? '#F9A825' : half && i === full+1 ? '#F9A825' : '#D8D8D8', fontSize: 14 }}>
          {i <= full ? '★' : half && i === full+1 ? '⭐' : '☆'}
        </span>
      ))}
      {count > 0 && <span style={s.starCount}>{rating.toFixed(1)} ({count})</span>}
    </span>
  );
};

// ─── Image gallery ────────────────────────────────────────────────────────────
const Gallery = ({ images }) => {
  const [active, setActive] = useState(0);
  if (!images?.length) return (
    <div style={s.galleryPlaceholder}>
      <span style={{ fontSize: 48 }}>📦</span>
    </div>
  );
  return (
    <div style={s.galleryWrap}>
      <div style={s.galleryHero}>
        <img
          src={images[active]}
          alt="Product"
          style={s.galleryHeroImg}
          onError={e => { e.target.src = 'https://via.placeholder.com/600x600/F5F5F5/BDBDBD?text=No+Image'; }}
        />
        {images.length > 1 && (
          <>
            {active > 0 && (
              <button style={{ ...s.galleryArrow, left: 12 }} onClick={() => setActive(a => a - 1)}>‹</button>
            )}
            {active < images.length - 1 && (
              <button style={{ ...s.galleryArrow, right: 12 }} onClick={() => setActive(a => a + 1)}>›</button>
            )}
            <div style={s.galleryCounter}>{active + 1} / {images.length}</div>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div style={s.thumbRow}>
          {images.map((uri, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{ ...s.thumb, ...(i === active ? s.thumbActive : {}) }}
            >
              <img src={uri} alt="" style={s.thumbImg} onError={e => { e.target.src = 'https://via.placeholder.com/80/F5F5F5/BDBDBD?text=+'; }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Info row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
  <div style={s.infoRow}>
    <span style={s.infoIcon}>{icon}</span>
    <span style={s.infoLabel}>{label}</span>
    <span style={s.infoValue}>{value || '—'}</span>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const ProductAppPage = () => {
  const { productId } = useParams();

  const [product, setProduct]               = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [countdown, setCountdown]           = useState(3);
  const [appLaunchTried, setAppLaunchTried] = useState(false);

  // ── Fetch product ──────────────────────────────────────────────────────────
  const fetchProduct = useCallback(async () => {
    if (!productId) { setError('Product not found.'); setLoading(false); return; }
    try {
      setError(null);
      const res = await productService.getProductById(productId);
      if (res?.data?.success || res?.status === 200) {
        const data        = res.data?.data?.product || res.data?.data || res.data;
        const related     = res.data?.data?.relatedProducts || [];
        const vendorProds = res.data?.data?.vendorProducts  || [];
        setProduct(data);
        setRelatedProducts(related);
        setVendorProducts(vendorProds);
      } else {
        setError('Could not load this product.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong loading this product.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // ── App deep-link + countdown ──────────────────────────────────────────────
  useEffect(() => {
    window.location.href = `cedimart://product/${productId}`;
    setAppLaunchTried(true);

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [productId]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  const handleOpenApp = () => {
    window.location.href = `cedimart://product/${productId}`;
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const images   = product?.images?.length > 0 ? product.images : [];
  const condition = product ? (CONDITION_LABELS[product.condition] || { label: product.condition, color: '#444', bg: '#F0F0F0' }) : null;
  const campus   = product ? (CAMPUS_LABELS[product.campus] || product.campus) : null;
  const isAvailable = product?.isAvailable && (product?.countInStock ?? 0) > 0;
  const discount = product?.discountInfo;
  const isOnSale = discount?.isOnSale && discount?.originalPrice > product?.price;

  // Specs from Map object
  const specEntries = product?.specifications
    ? Object.entries(product.specifications instanceof Map
        ? Object.fromEntries(product.specifications)
        : product.specifications
      ).filter(([, v]) => v !== undefined && String(v).trim() !== '')
    : [];

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.loadingWrap}>
          <div style={s.loadingSpinner} />
          <p style={s.loadingText}>Loading product…</p>
        </div>
        <style>{spinnerCSS}</style>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div style={s.page}>
        <div style={s.errorCard}>
          <div style={s.brandMark}>
            <span style={s.brandMarkIcon}>🛒</span>
          </div>
          <h2 style={s.errorTitle}>Product not found</h2>
          <p style={s.errorSub}>{error || 'This listing may have been removed or is no longer available.'}</p>
          <a href="/" style={s.primaryBtn}>Browse CediMart</a>
          <div style={s.storeLinksWrap}>
            <p style={s.storeLinksLabel}>Get the app</p>
            <a href="https://apps.apple.com/us/app/cedimart/id6762318566" style={s.storeBtn}>📱 App Store</a>
            <a href="https://play.google.com/store/apps/details?id=com.freshyfood.factory" style={s.storeBtnSecondary}>📱 Google Play</a>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* ── Smart app banner (iOS-style) ── */}
      <div style={s.appBanner}>
        <div style={s.appBannerLeft}>
          <span style={s.appBannerIcon}>🛒</span>
          <div>
            <p style={s.appBannerName}>CediMart</p>
            <p style={s.appBannerTagline}>Better experience in the app</p>
          </div>
        </div>
        <button onClick={handleOpenApp} style={s.appBannerBtn}>Open</button>
      </div>

      {/* ── Main card ── */}
      <div style={s.card}>

        {/* Gallery */}
        <Gallery images={images} />

        {/* Product info */}
        <div style={s.productInfo}>

          {/* Tags row */}
          {product.tags?.length > 0 && (
            <div style={s.tagsRow}>
              {product.tags.map(tag => (
                <span key={tag} style={s.tag}>
                  {tag.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          )}

          {/* Name */}
          <h1 style={s.productName}>{product.name}</h1>
          {product.brand && <p style={s.brandText}>by {product.brand}</p>}

          {/* Rating */}
          {(product.numReviews ?? 0) > 0 && (
            <div style={{ marginBottom: 12 }}>
              <Stars rating={product.rating || 0} count={product.numReviews || 0} />
            </div>
          )}

          {/* Price */}
          {isOnSale ? (
            <div style={s.salePriceBlock}>
              <div style={s.salePriceRow}>
                <span style={s.salePrice}>GH₵ {product.price?.toFixed(2)}</span>
                <span style={s.saleBadge}>
                  -{Math.round(discount.discountPercentage || ((discount.originalPrice - product.price) / discount.originalPrice * 100))}% OFF
                </span>
              </div>
              <div style={s.saleOrigRow}>
                <span style={s.saleWas}>was</span>
                <span style={s.saleOrig}>GH₵ {discount.originalPrice?.toFixed(2)}</span>
                <span style={s.saleSaving}>
                  Save GH₵ {(discount.originalPrice - product.price).toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div style={s.priceRow}>
              <span style={s.price}>GH₵ {product.price?.toFixed(2)}</span>
              {product.negotiable && (
                <span style={s.negotiableChip}>Price negotiable</span>
              )}
            </div>
          )}
          {isOnSale && product.negotiable && (
            <span style={{ ...s.negotiableChip, marginTop: 8, display: 'inline-block' }}>Price negotiable</span>
          )}

          {/* Availability */}
          <div style={{ ...s.availBanner, ...(isAvailable ? {} : s.availBannerOos) }}>
            <span style={{ ...s.availDot, backgroundColor: isAvailable ? '#4CAF50' : '#E53935' }} />
            <span style={{ ...s.availText, color: isAvailable ? '#2E7D32' : '#C62828' }}>
              {!isAvailable
                ? 'Currently unavailable'
                : (product.countInStock ?? 0) <= 3
                  ? `Only ${product.countInStock} left!`
                  : `${product.countInStock} in stock`}
            </span>
          </div>

          {/* Condition badge */}
          {condition && (
            <div style={{ marginBottom: 20 }}>
              <span style={{ ...s.conditionBadge, color: condition.color, backgroundColor: condition.bg }}>
                {condition.label}
              </span>
            </div>
          )}

          {/* ── Open app CTA ── */}
          <button onClick={handleOpenApp} style={s.primaryCTA}>
            Open in CediMart App
          </button>
          {countdown > 0 && (
            <p style={s.countdownText}>Opening app in {countdown}s…</p>
          )}

          {/* Divider */}
          <div style={s.divider} />

          {/* Description */}
          {product.description && (
            <div style={s.section}>
              <h2 style={s.sectionTitle}>Description</h2>
              <p style={s.descText}>{product.description}</p>
            </div>
          )}

          {/* Product details */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Product Details</h2>
            <div style={s.infoTable}>
              {product.category && (
                <InfoRow icon="📂" label="Category" value={product.category.replace(/-/g, ' ')} />
              )}
              {product.subcategory && (
                <InfoRow icon="📁" label="Subcategory" value={product.subcategory.replace(/-/g, ' ')} />
              )}
              {campus && (
                <InfoRow icon="🎓" label="Campus" value={campus} />
              )}
              {product.location?.campusArea && (
                <InfoRow icon="📍" label="Area" value={product.location.campusArea} />
              )}
              {product.location?.hostel && (
                <InfoRow icon="🏠" label="Hostel / Hall" value={product.location.hostel} />
              )}
              {product.brand && (
                <InfoRow icon="🏷️" label="Brand" value={product.brand} />
              )}
            </div>
          </div>

          {/* Specifications */}
          {specEntries.length > 0 && (
            <div style={s.section}>
              <h2 style={s.sectionTitle}>Specifications</h2>
              <div style={s.specTable}>
                {specEntries.map(([key, value], i) => (
                  <div key={key} style={{ ...s.specRow, ...(i % 2 === 1 ? s.specRowZebra : {}) }}>
                    <span style={s.specLabel}>{key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ')}</span>
                    <span style={s.specValue}>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seller */}
          {product.vendor && (
            <div style={s.section}>
              <h2 style={s.sectionTitle}>Seller</h2>
              <div style={s.sellerCard}>
                <div style={s.sellerAvatar}>
                  {product.vendor.avatar
                    ? <img src={product.vendor.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={s.sellerAvatarInitial}>{(product.vendor.name || 'S').charAt(0).toUpperCase()}</span>
                  }
                </div>
                <div style={s.sellerInfo}>
                  <p style={s.sellerName}>{product.vendor.name || 'Student Seller'}</p>
                  {campus && <p style={s.sellerCampus}>{campus}</p>}
                  {product.vendor.rating !== undefined && (
                    <Stars rating={product.vendor.rating || 0} />
                  )}
                </div>
              </div>
              <div style={s.safetyNote}>
                🛡️ <span>Always meet in a safe, public campus location when exchanging items.</span>
              </div>
            </div>
          )}

          {/* More from this seller */}
          {vendorProducts.length > 0 && (
            <div style={s.section}>
              <h2 style={s.sectionTitle}>More from this seller</h2>
              <div style={s.relatedRow}>
                {vendorProducts.slice(0, 6).map(item => (
                  <a
                    key={item._id}
                    href={`/product/${item._id}`}
                    style={s.relatedCard}
                    className="related-card"
                  >
                    <div style={s.relatedImgWrap}>
                      <img
                        src={item.images?.[0] || 'https://via.placeholder.com/140/F5F5F5/BDBDBD?text=+'}
                        alt={item.name}
                        style={s.relatedImg}
                        onError={e => { e.target.src = 'https://via.placeholder.com/140/F5F5F5/BDBDBD?text=+'; }}
                      />
                    </div>
                    <div style={s.relatedInfo}>
                      <p style={s.relatedName}>{item.name}</p>
                      <p style={s.relatedPrice}>GH₵ {Number(item.price).toFixed(2)}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Similar listings */}
          {relatedProducts.length > 0 && (
            <div style={s.section}>
              <h2 style={s.sectionTitle}>Similar Listings</h2>
              <div style={s.relatedRow}>
                {relatedProducts.slice(0, 6).map(item => (
                  <a
                    key={item._id}
                    href={`/product/${item._id}`}
                    style={s.relatedCard}
                    className="related-card"
                  >
                    <div style={s.relatedImgWrap}>
                      <img
                        src={item.images?.[0] || 'https://via.placeholder.com/140/F5F5F5/BDBDBD?text=+'}
                        alt={item.name}
                        style={s.relatedImg}
                        onError={e => { e.target.src = 'https://via.placeholder.com/140/F5F5F5/BDBDBD?text=+'; }}
                      />
                    </div>
                    <div style={s.relatedInfo}>
                      <p style={s.relatedName}>{item.name}</p>
                      <p style={s.relatedPrice}>GH₵ {Number(item.price).toFixed(2)}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div style={s.divider} />

          {/* Get the app */}
          <div style={s.getAppSection}>
            <div style={s.getAppBrand}>
              <div style={s.getAppBrandIcon}>🛒</div>
              <div>
                <p style={s.getAppBrandName}>CediMart</p>
                <p style={s.getAppBrandTag}>The Student Marketplace</p>
              </div>
            </div>
            <p style={s.getAppCopy}>
              Get the full experience — browse thousands of listings from students at your campus, message sellers instantly, and discover great deals.
            </p>
            <button onClick={handleOpenApp} style={s.primaryCTA}>Open in App</button>
            <p style={s.getAppOrDivider}>Don't have the app?</p>
            <div style={s.storeRow}>
              <a href="https://apps.apple.com/us/app/cedimart/id6762318566" style={s.storeBtn}>
                <span>🍎</span> App Store
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.freshyfood.factory" style={s.storeBtnSecondary}>
                <span>▶</span> Google Play
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer style={s.footer}>
        <p style={s.footerText}>© {new Date().getFullYear()} CediMart · Campus Marketplace</p>
      </footer>
    </div>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
// Deep forest green #1A3C2A, warm off-white #F8F7F4, cedar amber #C8863A

const s = {
  // Page
  page: {
    minHeight: '100vh',
    backgroundColor: '#F0F2EF',
    fontFamily: "'Calibri', 'Arial', sans-serif",
    WebkitFontSmoothing: 'antialiased',
  },

  // App smart banner (top of page)
  appBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottom: '1px solid #EAEAEA',
    padding: '10px 16px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
  },
  appBannerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  appBannerIcon: { fontSize: 28, lineHeight: 1 },
  appBannerName: { margin: 0, fontSize: 14, fontWeight: 700, color: '#1A1A1A' },
  appBannerTagline: { margin: 0, fontSize: 11, color: '#9E9E9E' },
  appBannerBtn: {
    backgroundColor: '#1A3C2A',
    color: '#fff',
    border: 'none',
    borderRadius: 20,
    padding: '8px 18px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    flexShrink: 0,
  },

  // Main card
  card: {
    maxWidth: 520,
    margin: '0 auto',
    backgroundColor: '#fff',
    boxShadow: '0 4px 30px rgba(0,0,0,0.08)',
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 24,
  },

  // Gallery
  galleryWrap: { backgroundColor: '#F5F5F5' },
  galleryPlaceholder: {
    height: 280,
    backgroundColor: '#F0F0F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryHero: { position: 'relative', height: 340, overflow: 'hidden', backgroundColor: '#EBEBEB' },
  galleryHeroImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  galleryArrow: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.42)',
    border: 'none',
    color: '#fff',
    fontSize: 20,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryCounter: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.48)',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 9px',
    borderRadius: 12,
  },
  thumbRow: {
    display: 'flex',
    gap: 8,
    padding: '10px 12px',
    overflowX: 'auto',
    backgroundColor: '#fff',
  },
  thumb: {
    flexShrink: 0,
    width: 58,
    height: 58,
    borderRadius: 10,
    overflow: 'hidden',
    border: '2px solid transparent',
    padding: 0,
    cursor: 'pointer',
    backgroundColor: '#F0F0F0',
  },
  thumbActive: { border: '2px solid #1A3C2A' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },

  // Product info block
  productInfo: { padding: '20px 20px 28px' },
  tagsRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: 700,
    padding: '3px 9px',
    borderRadius: 20,
    textTransform: 'capitalize',
  },
  productName: {
    fontSize: 22,
    fontWeight: 800,
    color: '#1A1A1A',
    margin: '0 0 4px',
    lineHeight: 1.3,
    letterSpacing: '-0.3px',
  },
  brandText: { fontSize: 13, color: '#9E9E9E', margin: '0 0 10px' },

  // Stars
  starsWrap: { display: 'inline-flex', alignItems: 'center', gap: 2 },
  starCount: { fontSize: 12, color: '#9E9E9E', marginLeft: 6, fontWeight: 500 },

  // Price
  priceRow: { display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0 10px' },
  price: { fontSize: 28, fontWeight: 900, color: '#1A3C2A', letterSpacing: '-0.5px' },
  negotiableChip: {
    backgroundColor: '#FFF3E0',
    border: '1px solid #FFCC80',
    color: '#E65100',
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 10,
  },

  // Sale price
  salePriceBlock: { margin: '12px 0 10px' },
  salePriceRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 },
  salePrice: { fontSize: 28, fontWeight: 900, color: '#C62828', letterSpacing: '-0.5px' },
  saleBadge: {
    backgroundColor: '#FFEBEE',
    border: '1px solid #FFCDD2',
    color: '#C62828',
    fontSize: 11,
    fontWeight: 800,
    padding: '4px 9px',
    borderRadius: 8,
  },
  saleOrigRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  saleWas: { fontSize: 12, color: '#9E9E9E' },
  saleOrig: { fontSize: 14, color: '#BDBDBD', textDecoration: 'line-through' },
  saleSaving: { fontSize: 12, color: '#2E7D32', fontWeight: 700 },

  // Availability
  availBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F8F3',
    border: '1px solid #C8E6C9',
    borderRadius: 10,
    padding: '9px 14px',
    marginBottom: 14,
    marginTop: 4,
  },
  availBannerOos: { backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2' },
  availDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  availText: { fontSize: 13, fontWeight: 600 },

  // Condition
  conditionBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 12px',
    borderRadius: 20,
    display: 'inline-block',
  },

  // CTAs
  primaryCTA: {
    width: '100%',
    backgroundColor: '#1A3C2A',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    padding: '16px',
    fontSize: 16,
    fontWeight: 800,
    cursor: 'pointer',
    display: 'block',
    textAlign: 'center',
    boxShadow: '0 4px 16px rgba(26,60,42,0.3)',
    letterSpacing: '0.1px',
    marginBottom: 8,
    boxSizing: 'border-box',
  },
  countdownText: { fontSize: 12, color: '#9E9E9E', textAlign: 'center', margin: '4px 0 0' },

  // Divider
  divider: { height: 1, backgroundColor: '#F0F0F0', margin: '24px 0' },

  // Sections
  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#1A1A1A',
    marginBottom: 14,
    margin: '0 0 14px',
  },
  descText: { fontSize: 15, lineHeight: 1.7, color: '#555', margin: 0 },

  // Info table
  infoTable: {
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid #F0F0F0',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 14px',
    borderBottom: '1px solid #F8F8F8',
    gap: 10,
  },
  infoIcon: { fontSize: 15, width: 22, textAlign: 'center', flexShrink: 0 },
  infoLabel: { fontSize: 12, color: '#9E9E9E', fontWeight: 600, width: '38%', flexShrink: 0, textTransform: 'capitalize' },
  infoValue: { fontSize: 13, color: '#1A1A1A', fontWeight: 600, flex: 1, textTransform: 'capitalize' },

  // Spec table
  specTable: { borderRadius: 12, overflow: 'hidden', border: '1px solid #F0F0F0' },
  specRow: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '10px 14px',
    borderBottom: '1px solid #F8F8F8',
    gap: 10,
  },
  specRowZebra: { backgroundColor: '#FAFCFA' },
  specLabel: { fontSize: 12, color: '#9E9E9E', fontWeight: 600, width: '38%', flexShrink: 0, textTransform: 'capitalize' },
  specValue: { fontSize: 13, color: '#1A1A1A', fontWeight: 600, flex: 1 },

  // Seller
  sellerCard: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  sellerAvatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#E8F5E9',
    overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  sellerAvatarInitial: { fontSize: 20, fontWeight: 800, color: '#2E7D32' },
  sellerInfo: { flex: 1 },
  sellerName: { fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: '0 0 2px' },
  sellerCampus: { fontSize: 12, color: '#9E9E9E', margin: '0 0 4px' },
  safetyNote: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#EFF6FF',
    border: '1px solid #BFDBFE',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 12,
    color: '#1D4ED8',
    lineHeight: 1.5,
  },

  // Related
  relatedRow: {
    display: 'flex',
    gap: 12,
    overflowX: 'auto',
    paddingBottom: 4,
  },
  relatedCard: {
    flexShrink: 0,
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    border: '1px solid #F0F0F0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  },
  relatedImgWrap: { height: 104, overflow: 'hidden', backgroundColor: '#F5F5F5' },
  relatedImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  relatedInfo: { padding: '8px 10px' },
  relatedName: { fontSize: 12, fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px', lineHeight: 1.35,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  relatedPrice: { fontSize: 14, fontWeight: 800, color: '#1A3C2A', margin: 0 },

  // Get the app section
  getAppSection: { textAlign: 'center' },
  getAppBrand: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 },
  getAppBrandIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: '#E8F5E9',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 24,
  },
  getAppBrandName: { fontSize: 17, fontWeight: 800, color: '#1A1A1A', margin: '0 0 1px', textAlign: 'left' },
  getAppBrandTag: { fontSize: 12, color: '#9E9E9E', margin: 0, textAlign: 'left' },
  getAppCopy: { fontSize: 14, color: '#666', lineHeight: 1.6, margin: '0 0 20px', textAlign: 'center' },
  getAppOrDivider: { fontSize: 13, color: '#9E9E9E', margin: '12px 0 10px' },
  storeRow: { display: 'flex', gap: 10, justifyContent: 'center' },
  storeBtn: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: 13,
    fontWeight: 700,
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  storeBtnSecondary: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    color: '#1A3C2A',
    border: '1px solid #C8E6C9',
    textDecoration: 'none',
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: 13,
    fontWeight: 700,
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  // Error card
  errorCard: {
    maxWidth: 400,
    margin: '60px auto 0',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: '36px 28px',
    textAlign: 'center',
    boxShadow: '0 4px 30px rgba(0,0,0,0.08)',
  },
  brandMark: { marginBottom: 16 },
  brandMarkIcon: { fontSize: 44 },
  errorTitle: { fontSize: 20, fontWeight: 800, color: '#1A1A1A', margin: '0 0 8px' },
  errorSub: { fontSize: 14, color: '#9E9E9E', margin: '0 0 24px', lineHeight: 1.6 },
  storeLinksWrap: { marginTop: 24 },
  storeLinksLabel: { fontSize: 13, color: '#9E9E9E', marginBottom: 10 },

  // Loading
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 },
  loadingSpinner: {
    width: 40, height: 40,
    borderRadius: 20,
    border: '3px solid #E8F5E9',
    borderTopColor: '#1A3C2A',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: { fontSize: 14, color: '#9E9E9E' },

  // Footer
  footer: { textAlign: 'center', padding: '20px 16px 36px' },
  footerText: { fontSize: 11, color: '#BDBDBD', margin: 0 },
};

// ─── Injected CSS ─────────────────────────────────────────────────────────────
const spinnerCSS = `
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const css = `
  @keyframes spin { to { transform: rotate(360deg); } }
  * { box-sizing: border-box; }
  body { margin: 0; }
  button { font-family: inherit; }
  a { color: inherit; }

  .related-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.1) !important; transition: transform 0.18s ease, box-shadow 0.18s ease; }

  /* Spinner */
  .loading-spinner {
    width: 40px; height: 40px;
    border-radius: 50%;
    border: 3px solid #E8F5E9;
    border-top-color: #1A3C2A;
    animation: spin 0.8s linear infinite;
  }

  /* Scrollbar hidden on thumb row */
  ::-webkit-scrollbar { height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #E0E0E0; border-radius: 4px; }

  /* Responsive */
  @media (max-width: 540px) {
    .product-card { margin: 0 !important; border-radius: 0 !important; }
  }
`;

export default ProductAppPage;