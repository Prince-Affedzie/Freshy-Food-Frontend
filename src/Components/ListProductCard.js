// src/components/ListProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ConditionBadge from './ConditionBadge';
import { CATEGORIES } from '../config/products';

const ListProductCard = ({ product, onAddToCart, onQtyChange, qtyInCart, isAdding, isUpdating }) => {
  const imageUri = product.images?.[0];
  const catCfg = CATEGORIES.find(c => c.id === product.category) || CATEGORIES[CATEGORIES.length - 1];
  const outOfStock = (product.countInStock ?? 0) <= 0;
  const isLoading = isAdding || isUpdating;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex">
      {/* Image */}
      <Link to={`/product/${product._id}`} className="w-28 sm:w-32 flex-shrink-0 relative bg-gray-50">
        {imageUri ? (
          <img src={imageUri} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: catCfg.color }}
          >
            {catCfg.emoji}
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-xs">N/A</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start gap-2 mb-1">
            <Link to={`/product/${product._id}`} className="flex-1">
              <h3 className="text-sm sm:text-base font-bold text-gray-800 line-clamp-2 leading-tight">
                {product.name}
              </h3>
            </Link>
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-base sm:text-lg flex-shrink-0"
              style={{ backgroundColor: catCfg.color }}
            >
              {catCfg.emoji}
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {product.campus && (
              <span className="inline-flex items-center gap-0.5 bg-green-50 text-green-700 text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-2 h-2">
                  <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3z"/>
                </svg>
                {product.campus}
              </span>
            )}
            {product.condition && <ConditionBadge condition={product.condition} />}
            {product.negotiable && (
              <span className="bg-green-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">Nego</span>
            )}
          </div>

          {product.subcategory && (
            <p className="text-[10px] sm:text-xs text-gray-400 capitalize mb-1">
              {product.subcategory.replace(/-/g, ' ')}
            </p>
          )}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <span className="text-base sm:text-lg font-extrabold text-green-900">
            GH₵ {product.price?.toFixed(2)}
          </span>

          {qtyInCart === 0 ? (
            <button
              onClick={() => onAddToCart(product)}
              disabled={isLoading || outOfStock}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                outOfStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600 shadow-md'
              }`}
            >
              {isAdding ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : outOfStock ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
                </svg>
              )}
              {outOfStock ? 'Unavailable' : 'Add to Cart'}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-green-50 rounded-full px-1.5 py-1 border-2 border-green-200">
              <button
                onClick={() => onQtyChange(product, 'decrease')}
                disabled={isLoading}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-green-200 flex items-center justify-center hover:bg-green-100"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-green-700">
                  <path d="M5 12h14" />
                </svg>
              </button>
              {isUpdating ? (
                <div className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-sm sm:text-base font-extrabold text-green-800 min-w-[28px] text-center">
                  {qtyInCart}
                </span>
              )}
              <button
                onClick={() => onQtyChange(product, 'increase')}
                disabled={isLoading || qtyInCart >= (product.countInStock ?? 0)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-green-200 flex items-center justify-center hover:bg-green-100"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-green-700">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListProductCard;