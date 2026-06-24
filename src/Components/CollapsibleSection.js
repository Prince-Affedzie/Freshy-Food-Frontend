// src/components/CollapsibleSection.jsx
import React, { useState } from 'react';

const CollapsibleSection = ({ title, children, defaultOpen = false, badge }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-gray-100">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-6 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-bold text-gray-900">{title}</span>
          {badge != null && (
            <span className="bg-green-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-5">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;