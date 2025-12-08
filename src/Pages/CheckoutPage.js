// src/pages/CheckoutPage.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  FiChevronLeft, FiCheck, FiTruck, FiCreditCard,
  FiDollarSign, FiMapPin, FiCalendar, FiUser,
  FiMail, FiPhone, FiLock, FiShield, FiInfo
} from 'react-icons/fi';
import {createOrder} from '../Apis/orderApi'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // All hooks at the top — always called!
  const orderData = location.state;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    deliveryDay: 'saturday',
    deliveryTime: 'afternoon',
    paymentMethod: 'cash_on_delivery',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Early return AFTER hooks
  if (!orderData || !orderData.basket || orderData.basket.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F0FFF0] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-lg">
          <div className="text-7xl mb-6">🛒</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Your basket is empty</h2>
          <p className="text-gray-600 mb-10">
            Please customize a package before checking out.
          </p>
          <Link
            to="/packages"
            className="inline-block w-full py-5 bg-gradient-to-r from-[#228B22] to-[#006400] text-white text-lg font-bold rounded-2xl hover:shadow-2xl transition transform hover:-translate-y-1"
          >
            Browse Packages
          </Link>
        </div>
      </div>
    );
  }

  // Now safe to destructure - using new pricing data structure
  const {
    basket: basketItems,
    package: packageInfo,
    packageBasePrice,
    packageValuePrice,
    priceAdjustment,
    finalPrice,
    itemsTotalValue
  } = orderData;

  // Handle backward compatibility with old data structure
  const hasAdjustment = priceAdjustment !== undefined && priceAdjustment !== 0;
  const isDiscount = hasAdjustment && priceAdjustment < 0;
  const excessAmount = priceAdjustment > 0 ? priceAdjustment : 0;
  const finalTotal = finalPrice || orderData.finalTotal || 0;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderPayload = {
  customer: {
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    email: formData.email.toLowerCase(),
    phone: formData.phone
  },
  package: {
    id: packageInfo._id,
    name: packageInfo.name,
    basePrice: packageBasePrice,
    valuePrice: packageValuePrice || null
  },
  orderItems: basketItems.map(item => ({
    productId: item._id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image || null,
    unit: item.unit || 'unit'
  })),
  shippingAddress: {
    address: formData.address,
    city: formData.city,
    region: formData.region,
    phone: formData.phone
  },
  deliverySchedule: {
    preferredDay: formData.deliveryDay,
    preferredTime: formData.deliveryTime
  },
  deliveryNote: formData.notes,
  paymentMethod: formData.paymentMethod,
  pricing: {
    itemsPrice: finalTotal, // or recalculate on backend
    deliveryFee: 0,
    totalPrice: finalTotal
  }
};
console.log('Order submitted:', orderPayload);
const response = await createOrder(orderPayload)
if(response.status === 200){
   navigate('/order-success', {
        state: {
          orderNumber: orderPayload.orderNumber,
          total: finalTotal,
          deliveryDay: formData.deliveryDay,
          itemsCount: basketItems.reduce((sum, i) => sum + i.quantity, 0),
          packageName: packageInfo.name
        }
      });
}

    } catch (error) {
      const errorMessage =
              error.response?.data?.message ||
              error.response?.data?.error ||
              "An unexpected error occurred";
              toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0FFF0]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#228B22] to-[#006400] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-3 hover:opacity-90 transition"
            >
              <FiChevronLeft className="w-6 h-6" />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold">Checkout</h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-10">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="p-8 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Delivery Information</h2>
                    <p className="text-gray-600 mt-1">We'll deliver fresh on your chosen day</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <FiLock className="w-5 h-5" />
                    Secure
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Personal Info */}
                <section>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FiUser className="w-5 h-5 text-[#228B22]" /> Personal Details
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <input 
                      type="text" 
                      name="firstName" 
                      placeholder="First Name *" 
                      required 
                      value={formData.firstName} 
                      onChange={handleChange}
                      className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-[#228B22] outline-none transition" 
                    />
                   
                    <input 
                      type="text" 
                      name="lastName" 
                      placeholder="Last Name *" 
                      required 
                      value={formData.lastName} 
                      onChange={handleChange}
                      className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-[#228B22] outline-none" 
                    />
                  </div>
                </section>

                {/* Contact */}
                <section>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FiMail className="w-5 h-5 text-[#228B22]" /> Contact
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="Email *" 
                      required 
                      value={formData.email} 
                      onChange={handleChange}
                      className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-[#228B22] outline-none" 
                    />
                    <input 
                      type="tel" 
                      name="phone" 
                      placeholder="Phone (e.g. 0241234567) *" 
                      required 
                      value={formData.phone} 
                      onChange={handleChange}
                      className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-[#228B22] outline-none" 
                    />
                  </div>
                </section>

                {/* Address */}
                <section>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FiMapPin className="w-5 h-5 text-[#228B22]" /> Delivery Address
                  </h3>
                  <input 
                    type="text" 
                    name="address" 
                    placeholder="Street, House No., Landmark *" 
                    required 
                    value={formData.address} 
                    onChange={handleChange}
                    className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-[#228B22] outline-none mb-5" 
                  />
                  <div className="grid sm:grid-cols-2 gap-5">
                    <input 
                      type="text" 
                      name="city" 
                      placeholder="City/Town *" 
                      required 
                      value={formData.city} 
                      onChange={handleChange}
                      className="px-5 py-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-[#228B22] outline-none" 
                    />
                    <input 
                      type="text" 
                      name="region" 
                      placeholder="Region (e.g. Greater Accra) *" 
                      required 
                      value={formData.region} 
                      onChange={handleChange}
                      className="px-5 py-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-[#228B22] outline-none" 
                    />
                  </div>
                </section>

                {/* Delivery Schedule & Payment */}
                <div className="grid lg:grid-cols-2 gap-8">
                  <section>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FiCalendar className="w-5 h-5 text-[#228B22]" /> Delivery Day
                    </h3>
                    <select 
                      name="deliveryDay" 
                      value={formData.deliveryDay} 
                      onChange={handleChange}
                      className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-[#228B22] outline-none"
                    >
                      <option value="saturday">Saturday</option>
                      <option value="friday">Friday</option>
                      <option value="thursday">Thursday</option>
                    </select>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FiTruck className="w-5 h-5 text-[#228B22]" /> Time Slot
                    </h3>
                    <select 
                      name="deliveryTime" 
                      value={formData.deliveryTime} 
                      onChange={handleChange}
                      className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-[#228B22] outline-none"
                    >
                      <option value="morning">Morning (8AM–12PM)</option>
                      <option value="afternoon">Afternoon (12PM–4PM)</option>
                      <option value="evening">Evening (4PM–7PM)</option>
                    </select>
                  </section>
                </div>

                {/* Payment Method */}
                <section>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FiCreditCard className="w-5 h-5 text-[#228B22]" /> Payment Method
                  </h3>
                  <div className="space-y-4">
                    {['cash_on_delivery', 'mobile_money'].map(method => (
                      <label 
                        key={method} 
                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition ${
                          formData.paymentMethod === method ? 'border-[#228B22] bg-green-50' : 'border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          checked={formData.paymentMethod === method}
                          onChange={handleChange}
                          className="w-5 h-5 text-[#228B22]"
                        />
                        <div>
                          <div className="font-semibold capitalize">
                            {method === 'cash_on_delivery' ? 'Cash on Delivery' : 'Mobile Money'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {method === 'cash_on_delivery' ? 'Pay when you receive' : 'MTN, Vodafone, AirtelTigo'}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </section>

                {/* Notes */}
                <section>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    name="notes"
                    rows="4"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Allergies, gate code, preferred spot to leave package..."
                    className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-[#228B22] resize-none"
                  />
                </section>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1 mt-10 lg:mt-0">
            <div className="sticky top-6 space-y-6">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#228B22] to-[#006400] text-white p-8">
                  <h3 className="text-2xl font-bold">Order Summary</h3>
                  <p className="mt-2 opacity-90">{packageInfo.name}</p>
                </div>

                <div className="p-8 space-y-6">
                  {/* Items list */}
                  <div className="space-y-5 max-h-96 overflow-y-auto pr-2">
                    {basketItems.map(item => (
                      <div key={item._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center gap-4">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />
                          ) : (
                            <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center text-2xl font-bold text-gray-400">
                              {item.name[0]}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.quantity} {item.unit || 'unit'}{item.quantity > 1 ? 's' : ''}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">₵{item.price.toFixed(2)} each</div>
                          <div className="font-bold text-gray-900">
                            ₵{(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Value comparison section */}
                  {packageValuePrice && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FiDollarSign className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-bold text-blue-800">Value Comparison</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Items Total Value</span>
                          <span className="font-medium">₵{itemsTotalValue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Package Benchmark</span>
                          <span className="font-medium">₵{packageValuePrice.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-blue-200 my-2"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">Difference</span>
                          <span className={`font-bold ${itemsTotalValue >= packageValuePrice ? 'text-orange-600' : 'text-green-600'}`}>
                            {itemsTotalValue >= packageValuePrice ? '+' : '-'}₵{Math.abs(itemsTotalValue - packageValuePrice).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pricing breakdown */}
                  <div className="border-t-2 border-dashed pt-6 space-y-4">
                    <div className="flex justify-between text-lg">
                      <span>Package Base Price</span>
                      <span className="font-bold">₵{packageBasePrice.toFixed(2)}</span>
                    </div>
                    
                    {hasAdjustment && (
                      <div className={`flex justify-between font-medium rounded-lg p-3 ${isDiscount ? 'bg-green-50 text-green-800' : 'bg-orange-50 text-orange-800'}`}>
                        <div className="flex items-center gap-2">
                          <FiInfo className="w-4 h-4" />
                          <span>{isDiscount ? 'Price Discount' : 'Extra Charge'}</span>
                        </div>
                        <span className="font-bold">
                          {isDiscount ? '-' : '+'}₵{Math.abs(priceAdjustment).toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-green-600 text-lg">
                      <span>Delivery</span>
                      <span className="font-bold">FREE</span>
                    </div>

                    <div className="border-t-2 border-dashed pt-6">
                      <div className="flex justify-between items-center text-2xl font-bold">
                        <span>Total to Pay</span>
                        <span className="text-[#228B22]">₵{finalTotal.toFixed(2)}</span>
                      </div>
                      {hasAdjustment && (
                        <p className="text-right text-sm text-gray-500 mt-2">
                          {isDiscount ? 'Discount applied' : 'Extra charge for upgrades'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full py-6 rounded-3xl font-bold text-xl text-white transition-all flex items-center justify-center gap-4
                  ${isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#FF7F00] to-[#CC6600] hover:shadow-2xl hover:-translate-y-1'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCheck className="w-7 h-7" />
                    Pay ₵{finalTotal.toFixed(2)}
                  </>
                )}
              </button>

              {/* Security guarantee */}
              <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-6 text-center">
                <FiShield className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <p className="font-bold text-green-800">100% Fresh or Free</p>
                <p className="text-sm text-green-700 mt-2">Not happy? We'll make it right.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;