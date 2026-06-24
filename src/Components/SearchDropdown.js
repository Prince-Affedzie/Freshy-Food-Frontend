// src/components/SearchDropdown.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ConditionBadge from './ConditionBadge';
import { CATEGORY_CONFIG } from '../config/cedimart';

const SearchDropdown = ({ results, searching, searchQuery, onClose, onViewAll }) => {
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
      {results.length > 0 ? (
        <>
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 pt-3 pb-1">
            Products
          </div>
          {results.map((product) => (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_CONFIG[product.category]?.color || '#F5F5F5' }}
                >
                  {CATEGORY_CONFIG[product.category]?.icon || '📦'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">{product.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-green-700">
                    GH₵ {product.price?.toFixed(2)}
                  </span>
                  {product.campus && (
                    <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">
                      {product.campus}
                    </span>
                  )}
                </div>
              </div>
              {product.condition && (
                <ConditionBadge condition={product.condition} />
              )}
            </Link>
          ))}
          
          <button
            onClick={onViewAll}
            className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-semibold text-green-700 hover:bg-green-50 border-t border-gray-50 transition-colors"
          >
            See all results for "{searchQuery}"
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </>
      ) : !searching ? (
        <div className="flex flex-col items-center py-8 text-gray-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-9 h-9 mb-2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span className="text-sm font-semibold text-gray-600">No results</span>
          <span className="text-xs text-gray-400 mt-0.5">Try a different keyword</span>
        </div>
      ) : null}
    </div>
  );
};

export default SearchDropdown;