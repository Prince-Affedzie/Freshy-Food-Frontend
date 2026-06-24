// src/components/StatsBanner.jsx
import React from 'react';

const StatsBanner = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="bg-green-900 mx-4 sm:mx-0 rounded-2xl py-4 px-6 flex justify-around items-center">
      <div className="text-center">
        <div className="text-lg sm:text-xl md:text-2xl font-extrabold text-white">
          {stats.totalProducts?.toLocaleString() ?? '—'}
        </div>
        <div className="text-xs text-green-300 mt-1 font-medium">Listings</div>
      </div>
      <div className="w-px h-8 bg-white/20" />
      <div className="text-center">
        <div className="text-lg sm:text-xl md:text-2xl font-extrabold text-white">
          {stats.byCampus?.length ?? '—'}
        </div>
        <div className="text-xs text-green-300 mt-1 font-medium">Campuses</div>
      </div>
      <div className="w-px h-8 bg-white/20" />
      <div className="text-center">
        <div className="text-lg sm:text-xl md:text-2xl font-extrabold text-white">
          {stats.byCategory?.length ?? '—'}
        </div>
        <div className="text-xs text-green-300 mt-1 font-medium">Categories</div>
      </div>
    </div>
  );
};

export default StatsBanner;