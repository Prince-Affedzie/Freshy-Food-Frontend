// src/components/Sheet.jsx
import React, { useEffect, useRef } from 'react';

const Sheet = ({ isOpen, onClose, title, children }) => {
  const sheetRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl animate-slide-up max-h-[80vh] overflow-hidden flex flex-col"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        
        {/* Header */}
        <div className="px-5 pb-3">
          <h3 className="text-lg font-extrabold text-green-900">{title}</h3>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto px-5 pb-6 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Sheet;