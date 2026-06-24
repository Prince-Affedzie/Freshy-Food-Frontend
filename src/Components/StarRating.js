// src/components/StarRating.jsx
import React from 'react';

const StarRating = ({ rating = 0, count = 0, size = 'md' }) => {
  const filled = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`${sizeClasses[size]} ${
            i <= filled
              ? 'text-yellow-500 fill-current'
              : half && i === filled + 1
              ? 'text-yellow-500'
              : 'text-gray-300'
          }`}
          fill={i <= filled ? 'currentColor' : half && i === filled + 1 ? 'url(#half)' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {count > 0 && (
        <span className={`ml-1.5 text-gray-500 font-medium ${textSizes[size]}`}>
          {rating.toFixed(1)} ({count})
        </span>
      )}
    </div>
  );
};

export default StarRating;