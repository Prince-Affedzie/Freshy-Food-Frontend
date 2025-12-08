// src/components/PackageCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiShoppingBag, FiChevronRight } from 'react-icons/fi';

const PackageCard = ({ pkg }) => {
  return (
    <Link 
      to={`/customize/${pkg.id}`}
      className={`relative bg-white rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 block ${
        pkg.recommended 
          ? 'border-emerald-500 shadow-lg' 
          : 'border-gray-200 hover:border-emerald-300'
      }`}
    >
      {pkg.recommended && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
            Most Popular
          </div>
        </div>
      )}

      {/* Package Image */}
      <div className="h-48 bg-gradient-to-r from-green-400 to-emerald-500 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <FiShoppingBag className="w-20 h-20 text-white/30" />
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="text-white font-bold text-2xl">{pkg.name}</div>
          <div className="text-white/90">{pkg.description}</div>
        </div>
      </div>

      {/* Package Content */}
      <div className="p-6">
        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{pkg.price}</span>
            <span className="text-gray-500">{pkg.period}</span>
          </div>
          {pkg.originalPrice && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-400 line-through">{pkg.originalPrice}</span>
              <span className="text-sm font-semibold text-green-600">
                {pkg.savings}
              </span>
            </div>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8">
          {pkg.items.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <FiCheck className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className={`w-full text-center py-3 px-4 rounded-lg font-semibold transition-colors ${
          pkg.recommended
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
            : 'bg-green-50 text-green-700'
        }`}>
          <div className="flex items-center justify-center gap-2">
            <FiShoppingBag className="w-5 h-5" />
            Customize Basket
            <FiChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PackageCard;