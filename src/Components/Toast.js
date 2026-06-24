// src/components/Toast.jsx
import React, { useEffect, useState } from 'react';

const Toast = ({ visible, message, productName, onClose, duration = 2200 }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      setTimeout(() => setIsAnimating(true), 50);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setShow(false);
          onClose?.();
        }, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div
        className={`flex items-center gap-3 bg-green-900 text-white px-5 py-3 rounded-full shadow-xl transition-all duration-300 ${
          isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
        }`}
      >
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <p className="text-sm">
          <span className="font-bold">{productName}</span> saved to cart
        </p>
      </div>
    </div>
  );
};

export default Toast;