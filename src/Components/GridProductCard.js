// src/components/GridProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ConditionBadge from './ConditionBadge';
import { CATEGORIES } from '../config/products';

const GridProductCard = ({ product, onAddToCart, onQtyChange, qtyInCart, isAdding, isUpdating }) => {
  const productId = product._id;
  const imageUri = product.images?.[0];
  const catCfg = CATEGORIES.find(c => c.id === product.category) || CATEGORIES[CATEGORIES.length - 1];
  const outOfStock = (product.countInStock ?? 0) <= 0;
  const isLoading = isAdding || isUpdating;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group">
      <Link to={`/product/${product._id}`} className="block">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
          {imageUri ? (
            <img
              src={imageUri}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-3xl"
              style={{ backgroundColor: catCfg.color }}
            >
              {catCfg.emoji}
            </div>
          )}

          {outOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-xs">Unavailable</span>
            </div>
          )}

          {/* Top-left: condition */}
          {product.condition && !outOfStock && (
            <div className="absolute top-2 left-2">
              <ConditionBadge condition={product.condition} />
            </div>
          )}

          {/* Top-right: negotiable */}
          {product.negotiable && !outOfStock && (
            <div className="absolute top-2 right-2 bg-green-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              Nego
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-3">
          <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-2 leading-tight">
            {product.name}
          </h3>

          {/* Campus + subcategory */}
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            {product.campus && (
              <span className="inline-flex items-center gap-0.5 bg-green-50 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-2 h-2">
                  <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3z"/>
                </svg>
                {product.campus}
              </span>
            )}
            {product.subcategory && (
              <span className="text-[10px] text-gray-400 capitalize">
                {product.subcategory.replace(/-/g, ' ')}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Footer with price and cart */}
      <div className="px-3 pb-3 flex items-center justify-between">
        <span className="text-base font-extrabold text-green-900">
          GH₵ {product.price?.toFixed(2)}
        </span>

        {qtyInCart === 0 ? (
          <button
            onClick={() => onAddToCart(product)}
            disabled={isLoading || outOfStock}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all ${
              outOfStock
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 hover:shadow-lg'
            }`}
          >
            {isAdding ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5 text-white">
                <path d="M12 5v14M5 12h14" />
              </svg>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-1 bg-green-50 rounded-full px-1 py-1 border-2 border-green-200">
            <button
              onClick={() => onQtyChange(product, 'decrease')}
              disabled={isLoading}
              className="w-6 h-6 rounded-full bg-white border border-green-200 flex items-center justify-center hover:bg-green-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-green-700">
                <path d="M5 12h14" />
              </svg>
            </button>
            {isUpdating ? (
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="text-sm font-extrabold text-green-800 min-w-[24px] text-center">
                {qtyInCart}
              </span>
            )}
            <button
              onClick={() => onQtyChange(product, 'increase')}
              disabled={isLoading || qtyInCart >= (product.countInStock ?? 0)}
              className="w-6 h-6 rounded-full bg-white border border-green-200 flex items-center justify-center hover:bg-green-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-green-700">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GridProductCard;