// src/components/DealCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ConditionBadge from './ConditionBadge';
import { CATEGORY_CONFIG } from '../config/cedimart';

const DealCard = ({ product }) => {
  const imageUri = product.images?.[0];
  const catCfg = CATEGORY_CONFIG[product.category] || CATEGORY_CONFIG.other;

  return (
    <Link
      to={`/product/${product._id}`}
      className="group relative w-40 sm:w-44 md:w-48 lg:w-52 h-52 sm:h-56 rounded-2xl overflow-hidden flex-shrink-0"
    >
      {/* Background Image */}
      {imageUri ? (
        <img
          src={imageUri}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      ) : (
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center text-4xl"
          style={{ backgroundColor: catCfg.color }}
        >
          {catCfg.icon}
        </div>
      )}

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Urgent Badge */}
      {product.tags?.includes('urgent-sale') && (
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 px-2.5 py-1 rounded-lg z-10">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 text-white">
            <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          <span className="text-white text-[10px] font-extrabold">Urgent</span>
        </div>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <h3 className="text-sm font-bold text-white line-clamp-1 mb-2">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2 mb-2">
          {product.condition && <ConditionBadge condition={product.condition} />}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base sm:text-lg font-extrabold text-green-300">
              GH₵ {product.price?.toFixed(2)}
            </div>
            {product.negotiable && (
              <div className="text-[10px] text-green-400 font-semibold">Negotiable</div>
            )}
          </div>
          
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-white">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DealCard;