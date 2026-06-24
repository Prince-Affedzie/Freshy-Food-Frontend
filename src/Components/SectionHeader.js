// src/components/SectionHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const SectionHeader = ({ title, subtitle, linkTo, linkText = 'See all', urgent = false }) => {
  return (
    <div className="flex justify-between items-start mb-4">
      <div className={urgent ? 'flex items-center gap-2' : ''}>
        {urgent && <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />}
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800 mt-1 flex-shrink-0"
        >
          {linkText}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;