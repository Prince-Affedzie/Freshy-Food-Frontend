// src/pages/VendorPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const VendorAppPage = () => {
  const { vendorId } = useParams();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Try to open the app immediately
    window.location.href = `cedimart://vendor/${vendorId}`;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [vendorId]);

  const handleOpenApp = () => {
    window.location.href = `cedimart://vendor/${vendorId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 to-orange-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🏪</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
            CediMart Vendor
          </h1>
          <p className="text-gray-500">Shop from this vendor on CediMart</p>
        </div>

        <button
          onClick={handleOpenApp}
          className="w-full bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl mb-4 hover:bg-orange-700 transition-colors text-lg shadow-lg shadow-orange-600/30"
        >
          Open in CediMart App
        </button>

        {countdown > 0 && (
          <p className="text-sm text-gray-400 mb-6">
            Opening app automatically in {countdown} seconds...
          </p>
        )}

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sm text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-3">
            Don't have the app yet?
          </p>
          <a
            href="https://apps.apple.com/app/cedimart/idYOUR_APP_ID"
            className="block w-full bg-black text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-900 transition-colors"
          >
            📱 Download on App Store
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.freshyfood.factory"
            className="block w-full bg-orange-50 text-orange-800 font-semibold py-3 px-6 rounded-xl border border-orange-200 hover:bg-orange-100 transition-colors"
          >
            📱 Get it on Google Play
          </a>
        </div>
      </div>
    </div>
  );
};

export default VendorAppPage;