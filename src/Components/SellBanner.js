// src/components/SellBanner.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const SellBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-green-900 rounded-2xl overflow-hidden flex min-h-[180px] sm:min-h-[200px]">
      <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
        <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full mb-3 self-start">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-white">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span className="text-white text-[10px] sm:text-xs font-bold">FOR SELLERS</span>
        </div>
        
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight mb-2">
          Got something to sell?
        </h2>
        
        <p className="text-xs sm:text-sm text-green-300 mb-4 max-w-md">
          List your items for free and reach thousands of students across campuses
        </p>
        
        <button
          onClick={() => navigate('/vendor-signup')}
          className="inline-flex items-center gap-2 bg-white text-green-900 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-green-50 transition-colors self-start"
        >
          Start Selling
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <div className="hidden sm:flex w-28 md:w-32 items-center justify-center bg-green-800/50 text-5xl md:text-6xl">
        🛍️
      </div>
    </div>
  );
};

export default SellBanner;