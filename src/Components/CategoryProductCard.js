// src/components/CategoryProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { CONDITION_CONFIG } from '../config/category';

const CategoryProductCard = ({ product }) => {
  const condition = CONDITION_CONFIG[product.condition] || CONDITION_CONFIG['good'];
  const isAvailable = product.isAvailable && (product.countInStock ?? 0) > 0;
  const isLowStock = isAvailable && (product.countInStock ?? 0) <= 3;
  const images = product.images?.length > 0 ? product.images : ['https://via.placeholder.com/300x300/F5F5F5/BDBDBD?text=No+Image'];

  return (
    <Link
      to={`/product/${product._id || product.id}`}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        <img
          src={images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Condition badge */}
        <div
          className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold"
          style={{ backgroundColor: condition.bg, color: condition.color }}
        >
          {condition.label}
        </div>

        {/* Sold out overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-extrabold text-sm">Sold Out</span>
          </div>
        )}

        {/* Low stock badge */}
        {isLowStock && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Only {product.countInStock} left
          </div>
        )}

        {/* Negotiable tag */}
        {product.negotiable && (
          <div className="absolute top-2 right-2 bg-orange-500/90 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold">
            Nego.
          </div>
        )}

        {/* Multiple images indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 text-white px-1.5 py-0.5 rounded-lg text-[10px] font-semibold">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-2.5 h-2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            {images.length}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-2 leading-tight min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Location */}
        {(product.campus || product.location?.campusArea) && (
          <div className="flex items-center gap-1 mb-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-gray-400 flex-shrink-0">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="text-[11px] text-gray-500 truncate">
              {[product.campus, product.location?.campusArea].filter(Boolean).join(' · ')}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-base font-extrabold text-green-900">
              GH₵ {product.price?.toFixed(2)}
            </div>
            {product.vendor?.name && (
              <div className="text-[10px] text-gray-400 mt-0.5">@{product.vendor.name}</div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryProductCard;