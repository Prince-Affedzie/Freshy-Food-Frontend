// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ConditionBadge from './ConditionBadge';
import { CATEGORY_CONFIG } from '../config/cedimart';

const ProductCard = ({ product }) => {
  const imageUri = product.images?.[0];
  const catCfg = CATEGORY_CONFIG[product.category] || CATEGORY_CONFIG.other;

  return (
    <Link
      to={`/product/${product._id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Image Container */}
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
            {catCfg.icon}
          </div>
        )}
        
        {/* Condition Badge */}
        {product.condition && (
          <div className="absolute top-2 left-2">
            <ConditionBadge condition={product.condition} />
          </div>
        )}
        
        {/* Negotiable Tag */}
        {product.negotiable && (
          <div className="absolute top-2 right-2 bg-green-900 rounded-md px-2 py-0.5">
            <span className="text-white text-[10px] font-bold">Negotiable</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 leading-tight">
          {product.name}
        </h3>
        
        {product.campus && (
          <div className="inline-flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg mb-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 text-green-700">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
            </svg>
            <span className="text-[10px] font-semibold text-green-700">{product.campus}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-1">
          <span className="text-base sm:text-lg font-extrabold text-green-900">
            GH₵ {product.price?.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;