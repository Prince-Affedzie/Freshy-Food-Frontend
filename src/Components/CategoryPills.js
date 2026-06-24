// src/components/CategoryPills.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_CONFIG } from '../config/cedimart';

const CategoryPills = () => {
  const navigate = useNavigate();

  const handleCategoryPress = (category) => {
    navigate(`/products?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
        <button
          key={key}
          onClick={() => handleCategoryPress(key)}
          className="flex flex-col items-center flex-shrink-0 w-16 sm:w-20 group"
        >
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-1.5 border-2 group-hover:scale-110 transition-transform duration-200"
            style={{ backgroundColor: cfg.color, borderColor: cfg.color }}
          >
            {cfg.icon}
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-gray-700 text-center leading-tight line-clamp-2">
            {cfg.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default CategoryPills;