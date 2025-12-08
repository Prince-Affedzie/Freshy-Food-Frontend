// src/pages/OrderSuccess.jsx
import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  FiCheck, FiHome, FiShoppingBag, FiPhone, FiMail, 
  FiCalendar, FiTruck, FiPackage, FiUser, FiMapPin,
  FiDollarSign, FiInfo, FiRefreshCw
} from 'react-icons/fi';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the data passed from CheckoutPage
  const { 
    orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 999)}`,
    total = 0,
    deliveryDay = 'saturday',
    itemsCount = 0,
    packageName = 'Your Package',
    basket = [],
    package: packageInfo,
    customerInfo,
    deliveryInfo,
    pricingInfo
  } = location.state || {};

  // If no state data, show error
  if (!location.state) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-8">
              We couldn't find your order details. Please place a new order.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/packages')}
                className="w-full py-3 bg-gradient-to-r from-[#228B22] to-[#006400] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Browse Packages
              </button>
              <button 
                onClick={() => navigate('/')}
                className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (date) => {
    return new Date(date || Date.now()).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time slot
  const formatTimeSlot = (time) => {
    const timeMap = {
      'morning': 'Morning (8AM–12PM)',
      'afternoon': 'Afternoon (12PM–4PM)',
      'evening': 'Evening (4PM–7PM)'
    };
    return timeMap[time] || time;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0FFF0]">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-[#228B22] to-[#006400] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <FiCheck className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Order Confirmed!</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Your fresh weekly basket is being prepared for delivery
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 -mt-8">
        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-200">
          <div className="bg-gradient-to-r from-[#228B22]/10 to-[#FF7F00]/10 p-8 border-b">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order #{orderNumber}</h2>
                <p className="text-gray-600">Placed on {formatDate()}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="px-4 py-2 bg-[#228B22] text-white rounded-full font-semibold text-sm">
                  Confirmed
                </div>
                <div className="px-4 py-2 bg-[#FF7F00] text-white rounded-full font-semibold text-sm">
                  Preparing
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Package & Delivery Info */}
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-8">
              {/* Package Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiPackage className="w-5 h-5 text-[#228B22]" />
                  Package Details
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Package:</span>
                    <span className="font-bold text-gray-900">{packageName}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-bold text-[#228B22]">{itemsCount} items</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium text-gray-900">
                      {location.state?.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Mobile Money'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Schedule */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiCalendar className="w-5 h-5 text-[#FF7F00]" />
                  Delivery Schedule
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Delivery Day:</span>
                    <span className="font-bold text-gray-900 capitalize">{deliveryDay}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Time Slot:</span>
                    <span className="font-medium text-gray-900">{formatTimeSlot(location.state?.deliveryTime)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Cut-off Time:</span>
                    <span className="font-medium text-gray-900">Thursday, 8 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            {(customerInfo || location.state?.customer) && (
              <div className="mb-8 p-4 sm:p-6 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-blue-600" />
                  Delivery Information
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Name</div>
                    <div className="font-medium text-gray-900">
                      {customerInfo?.firstName || location.state?.customer?.firstName} {customerInfo?.lastName || location.state?.customer?.lastName}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Phone</div>
                    <div className="font-medium text-gray-900">
                      {customerInfo?.phone || location.state?.customer?.phone}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-sm text-gray-600">Delivery Address</div>
                    <div className="font-medium text-gray-900">
                      {customerInfo?.address || location.state?.delivery?.address}, {customerInfo?.city || location.state?.delivery?.city}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                <div className="text-2xl font-bold text-[#228B22]">₵{total.toFixed(2)}</div>
              </div>
              
              {/* Items list (if available) */}
              {basket && basket.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <FiShoppingBag className="w-4 h-4" />
                    Your Selected Items ({basket.length})
                  </h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {basket.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <span className="font-bold text-gray-400">{item.name?.[0]}</span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.quantity} {item.unit || 'unit'}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">₵{(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                    {basket.length > 5 && (
                      <div className="text-center text-sm text-gray-500 pt-2">
                        + {basket.length - 5} more items in your basket
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pricing breakdown */}
              {pricingInfo && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Package Base Price</span>
                    <span className="font-medium">₵{pricingInfo.packageBasePrice?.toFixed(2)}</span>
                  </div>
                  {pricingInfo.priceAdjustment !== undefined && pricingInfo.priceAdjustment !== 0 && (
                    <div className={`flex justify-between items-center p-3 rounded-lg ${pricingInfo.priceAdjustment < 0 ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                      <span className="flex items-center gap-2">
                        <FiInfo className="w-4 h-4" />
                        {pricingInfo.priceAdjustment < 0 ? 'Discount Applied' : 'Extra Charge'}
                      </span>
                      <span className="font-bold">
                        {pricingInfo.priceAdjustment < 0 ? '-' : '+'}₵{Math.abs(pricingInfo.priceAdjustment).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-green-600">
                    <span>Delivery</span>
                    <span className="font-bold">FREE</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>Total Paid</span>
                      <span className="text-[#228B22]">₵{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Next Steps & Contact */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Next Steps */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* What happens next */}
            <div className="bg-gradient-to-r from-[#228B22]/5 to-[#FF7F00]/5 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FiRefreshCw className="w-5 h-5" />
                What happens next?
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#228B22] text-white flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 mb-1">Order Confirmation</div>
                    <div className="text-sm text-gray-600">
                      You'll receive an order confirmation email and SMS within the next 30 minutes.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF7F00] text-white flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 mb-1">Phone Confirmation</div>
                    <div className="text-sm text-gray-600">
                      Our team will call you within 24 hours to confirm your delivery details and preferences.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#006400] text-white flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 mb-1">Fresh Delivery</div>
                    <div className="text-sm text-gray-600">
                      Your freshly packed basket will arrive at your chosen time on {deliveryDay}.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Actions */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                to="/"
                className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 hover:border-[#228B22] hover:shadow-md rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#228B22]/10 flex items-center justify-center">
                    <FiHome className="w-5 h-5 text-[#228B22]" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Return Home</div>
                    <div className="text-xs text-gray-500">Back to homepage</div>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-[#228B22] group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                to="/packages"
                className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 hover:border-[#FF7F00] hover:shadow-md rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FF7F00]/10 flex items-center justify-center">
                    <FiShoppingBag className="w-5 h-5 text-[#FF7F00]" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Browse Packages</div>
                    <div className="text-xs text-gray-500">View other options</div>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-[#FF7F00] group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-gradient-to-b from-[#228B22] to-[#006400] text-white rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-6">Need Help?</h3>
            <div className="space-y-4">
              <a 
                href="tel:+233500FRESHFOD" 
                className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <FiPhone className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium">Call Us</div>
                  <div className="text-sm text-white/80">0500-FRESH-FOOD</div>
                </div>
              </a>
              <a 
                href="mailto:support@freshharvest.com" 
                className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <FiMail className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium">Email Us</div>
                  <div className="text-sm text-white/80">support@freshharvest.com</div>
                </div>
              </a>
              <a 
                href="https://wa.me/233500FRESHFOD" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xl">💬</span>
                </div>
                <div>
                  <div className="font-medium">Chat on WhatsApp</div>
                  <div className="text-sm text-white/80">Get instant support</div>
                </div>
              </a>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-sm text-white/80">
                <strong>Important:</strong> Please save your order number <strong>#{orderNumber}</strong> for reference.
              </p>
            </div>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#228B22]/10 border border-[#228B22]/20 mb-4">
            <FiCheck className="w-4 h-4 text-[#228B22]" />
            <span className="text-sm font-semibold text-[#228B22]">Thank You!</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Thank you for choosing Fresh Harvest!
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your order helps support local farmers and promotes sustainable agriculture in Ghana.
            We're excited to bring fresh, healthy food to your table every week.
          </p>
          <div className="mt-6 text-sm text-gray-500">
            <p>You'll receive delivery updates via SMS.</p>
            <p className="mt-1">Have a wonderful day! 🌱</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;