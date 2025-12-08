// src/pages/CustomizePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiChevronLeft, FiShoppingBag, FiPlus, FiMinus, FiTrash2,
  FiRefreshCw, FiTruck, FiCheck, FiArrowRight, FiPackage,
  FiAlertCircle, FiX, FiInfo, FiCheckCircle, FiDollarSign
} from 'react-icons/fi';
import { getPackageById } from '../Apis/packageApi';

const CustomizePage = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const swapSectionRef = useRef(null);

  const [packageData, setPackageData] = useState(null);
  const [basketItems, setBasketItems] = useState([]);
  const [swapOptions, setSwapOptions] = useState([]);
  const [swappingItem, setSwappingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        const response = await getPackageById(packageId);

        if (response.status === 200) {
          const pkg = response.data;
          setPackageData(pkg);

          // Initialize basket with default items
          const initialBasket = pkg.defaultItems.map(item => ({
            ...item.product,
            _id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.image,
            category: item.product.category,
            unit: item.product.unit || 'unit',
            description: item.product.description || '',
            isAvailable: item.product.isAvailable !== false,
            countInStock: item.product.countInStock || 999,
            quantity: item.quantity,
            totalPrice: item.product.price * item.quantity
          }));

          // Initialize swap options
          const options = pkg.swapOptions.map(swap => ({
            ...swap.product,
            _id: swap.product._id,
            name: swap.product.name,
            price: swap.product.price,
            image: swap.product.image,
            category: swap.product.category,
            unit: swap.product.unit || 'unit',
            description: swap.product.description || '',
            isAvailable: swap.product.isAvailable !== false,
            countInStock: swap.product.countInStock || 999,
            quantity: swap.quantity || 1
          }));

          setBasketItems(initialBasket);
          setSwapOptions(options);
        }
      } catch (err) {
        setError("Failed to load package details. Please try again.");
        console.error("Error loading package:", err);
      } finally {
        setLoading(false);
      }
    };

    if (packageId) fetchPackage();
  }, [packageId]);

  // Calculate total value of selected items
  const calculateItemsTotal = () => {
    return basketItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Calculate price adjustment based on valuePrice benchmark
  const calculatePriceAdjustment = () => {
    if (!packageData?.valuePrice || !packageData?.basePrice) return 0;
    
    const itemsTotal = calculateItemsTotal();
    
    if (itemsTotal > packageData.valuePrice) {
      // Items exceed valuePrice, add extra to basePrice
      return itemsTotal - packageData.valuePrice;
    } else if (itemsTotal < packageData.valuePrice) {
      // Items below valuePrice, deduct from basePrice
      const difference = packageData.valuePrice - itemsTotal;
      // Maximum deduction is the difference between basePrice and valuePrice (our profit margin)
      const maxDeduction = packageData.basePrice - packageData.valuePrice;
      return -Math.min(difference, maxDeduction);
    }
    return 0;
  };

  // Calculate final price customer pays
  const calculateFinalPrice = () => {
    if (!packageData?.basePrice) return 0;
    
    const adjustment = calculatePriceAdjustment();
    const finalPrice = packageData.basePrice + adjustment;
    
    // Ensure final price is not less than valuePrice (minimum we can charge)
    return Math.max(finalPrice, packageData.valuePrice || packageData.basePrice);
  };

  const updateQuantity = (id, change) => {
    setBasketItems(prev => {
      const updated = prev.map(item =>
        item._id === id
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      ).filter(item => item.quantity > 0);
      return updated;
    });
  };

  const removeItem = (id) => {
    setBasketItems(prev => prev.filter(item => item._id !== id));
  };

  const startSwap = (item) => {
    setSwappingItem(item);
    setTimeout(() => {
      swapSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  const completeSwap = (option) => {
    if (!swappingItem || !option.isAvailable) return;

    setBasketItems(prev => {
      const filtered = prev.filter(i => i._id !== swappingItem._id);
      const newItem = {
        ...option,
        quantity: swappingItem.quantity,
        totalPrice: option.price * swappingItem.quantity
      };
      return [...filtered, newItem];
    });

    setSwapOptions(prev => prev.filter(o => o._id !== option._id));
    setSwappingItem(null);
  };

  const cancelSwap = () => {
    setSwappingItem(null);
  };

  const addFromSwapOptions = (option) => {
    if (!option.isAvailable) return;

    const existing = basketItems.find(i => i._id === option._id);
    if (existing) {
      updateQuantity(option._id, 1);
    } else {
      const newItem = {
        ...option,
        quantity: 1,
        totalPrice: option.price
      };
      setBasketItems(prev => [...prev, newItem]);
    }

    setSwapOptions(prev => prev.filter(o => o._id !== option._id));
  };

  const handleProceed = () => {
    if (basketItems.length === 0) return;

    const adjustment = calculatePriceAdjustment();
    const finalPrice = calculateFinalPrice();

    navigate('/checkout', {
      state: {
        basket: basketItems,
        package: packageData,
        packageBasePrice: packageData.basePrice,
        packageValuePrice: packageData.valuePrice,
        priceAdjustment: adjustment,
        finalPrice: finalPrice,
        itemsTotalValue: calculateItemsTotal()
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-[#228B22] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your package...</p>
        </div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-800 mb-4">{error || "Package not found"}</p>
          <Link to="/packages" className="mt-6 inline-block text-[#228B22] font-bold hover:underline">
            Back to Packages
          </Link>
        </div>
      </div>
    );
  }

  const itemsTotal = calculateItemsTotal();
  const priceAdjustment = calculatePriceAdjustment();
  const finalPrice = calculateFinalPrice();
  const hasAdjustment = priceAdjustment !== 0;
  const isDiscount = priceAdjustment < 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0FFF0]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#228B22] to-[#006400] text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            {/*<Link to="/packages" className="flex items-center gap-2 text-white/90 hover:text-white transition">
              <FiChevronLeft className="w-5 h-5" />
              <span className="text-sm sm:text-base">Back to Packages</span>
            </Link>*/}
            <div className="text-center px-2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Customize Your {packageData.name}</h1>
              <p className="text-white/80 mt-1 text-xs sm:text-sm">{packageData.description}</p>
            </div>
            <div className="w-12 sm:w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Basket */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#F0FFF0] to-white p-4 sm:p-6 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#228B22]/20 flex items-center justify-center">
                      <FiShoppingBag className="w-5 h-5 text-[#228B22]" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">Your Basket</h2>
                      <p className="text-gray-600 text-sm">Swap, adjust, or remove items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold text-[#228B22]">{basketItems.length}</div>
                    <p className="text-xs sm:text-sm text-gray-600">items</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {basketItems.length === 0 ? (
                  <div className="p-8 sm:p-12 text-center">
                    <div className="text-4xl mb-4">🛒</div>
                    <p className="text-gray-500">Add items from below to get started</p>
                  </div>
                ) : (
                  basketItems.map(item => (
                    <div key={item._id} className="p-4 sm:p-6 hover:bg-gray-50 transition">
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-bold text-gray-400">
                              {item.name[0]}
                            </div>
                          )}
                          {!item.isAvailable && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">Out of Stock</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-grow min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                            <div className="min-w-0">
                              <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{item.name}</h3>
                              <p className="text-xs sm:text-sm text-gray-500 capitalize mt-1">
                                {item.category} • {item.unit}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center bg-gray-100 rounded-full p-1">
                                <button 
                                  onClick={() => updateQuantity(item._id, -1)}
                                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-white transition flex items-center justify-center"
                                >
                                  <FiMinus className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                                <span className="w-10 sm:w-12 text-center font-bold text-base sm:text-lg">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item._id, 1)}
                                  disabled={item.quantity >= item.countInStock}
                                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-white transition disabled:opacity-50 flex items-center justify-center"
                                >
                                  <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="flex gap-2 sm:gap-3">
                              <button
                                onClick={() => startSwap(item)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium text-sm sm:text-base"
                              >
                                <FiRefreshCw className="w-4 h-4" />
                                <span>Swap</span>
                              </button>
                              <button
                                onClick={() => removeItem(item._id)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium text-sm sm:text-base"
                              >
                                <FiTrash2 className="w-4 h-4" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Swap / Add Section */}
            {swapOptions.length > 0 && (
              <div ref={swapSectionRef} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className={`p-4 sm:p-6 border-b ${swappingItem ? 'bg-blue-50' : 'bg-gradient-to-r from-orange-50 to-white'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${swappingItem ? 'bg-blue-100 text-blue-700 animate-pulse' : 'bg-orange-100 text-orange-600'}`}>
                        {swappingItem ? <FiRefreshCw className="w-5 h-5" /> : <FiPlus className="w-5 h-5" />}
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold">
                          {swappingItem ? `Swap "${swappingItem.name}" with...` : "Add More Items"}
                        </h2>
                        <p className="text-gray-600 text-sm">
                          {swappingItem
                            ? `${swapOptions.filter(o => o.isAvailable).length} available replacement${swapOptions.filter(o => o.isAvailable).length > 1 ? 's' : ''}`
                            : "Enhance your package"}
                        </p>
                      </div>
                    </div>
                    {swappingItem && (
                      <button
                        onClick={cancelSwap}
                        className="px-3 py-2 bg-white border-2 border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 font-medium text-sm flex items-center gap-2 justify-center sm:justify-start"
                      >
                        <FiX className="w-4 h-4" /> Cancel
                      </button>
                    )}
                  </div>

                  {swappingItem && (
                    <div className="bg-white border-2 border-dashed border-blue-300 rounded-lg p-3 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {swappingItem.image ? (
                          <img src={swappingItem.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-400">
                            {swappingItem.name[0]}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-grow">
                        <p className="text-xs text-gray-500">Currently selected</p>
                        <p className="font-bold text-sm truncate">{swappingItem.name}</p>
                        <p className="text-xs text-gray-600">Qty: {swappingItem.quantity}</p>
                      </div>
                      <FiArrowRight className="w-6 h-6 text-blue-600 flex-shrink-0 animate-pulse" />
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {swapOptions.map(option => (
                      <div
                        key={option._id}
                        onClick={() => swappingItem ? completeSwap(option) : addFromSwapOptions(option)}
                        className={`
                          relative border-2 rounded-lg sm:rounded-xl overflow-hidden cursor-pointer transition-all
                          ${!option.isAvailable
                            ? 'opacity-50 cursor-not-allowed border-gray-300'
                            : swappingItem
                              ? 'border-blue-400 hover:border-blue-600 hover:shadow-lg'
                              : 'border-gray-200 hover:border-[#228B22] hover:shadow-md'
                          }
                        `}
                      >
                        {swappingItem && option.isAvailable && (
                          <div className="absolute inset-0 border-4 border-blue-500 border-dashed rounded-lg sm:rounded-xl pointer-events-none animate-pulse"></div>
                        )}

                        <div className="h-32 sm:h-40 bg-gray-50">
                          {option.image ? (
                            <img src={option.image} alt={option.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl font-bold text-gray-300">
                              {option.name[0]}
                            </div>
                          )}
                          {!option.isAvailable && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white font-bold text-sm">Out of Stock</span>
                            </div>
                          )}
                        </div>

                        <div className="p-3 sm:p-4">
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2">{option.name}</h4>
                          <div className="flex justify-between items-center mt-2">
                            <div>
                              <p className="text-xs sm:text-sm text-gray-500 capitalize">{option.category}</p>
                              <p className="text-xs text-gray-600">{option.unit}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-[#228B22]">
                                ₵{option.price.toFixed(2)}
                              </div>
                              {option.isAvailable ? (
                                <span className="text-xs text-green-600 flex items-center gap-1 justify-end">
                                  <FiCheckCircle className="w-3 h-3" /> Available
                                </span>
                              ) : (
                                <span className="text-xs text-red-600">Unavailable</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1 mt-6 sm:mt-8 lg:mt-0">
            <div className="sticky top-4 sm:top-6">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#228B22] to-[#006400] p-4 sm:p-6 text-white">
                  <h3 className="text-xl sm:text-2xl font-bold">Order Summary</h3>
                  <p className="mt-1 opacity-90 text-sm sm:text-base">{packageData.name}</p>
                </div>

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
                    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#228B22]">
                        {basketItems.reduce((s, i) => s + i.quantity, 0)}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">Total Units</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#228B22]">{basketItems.length}</div>
                      <p className="text-xs sm:text-sm text-gray-600">Unique Items</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <FiDollarSign className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-bold text-blue-800">Package Value Benchmark</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Items Total Value</span>
                        <span className="font-bold">₵{itemsTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-600">Package Benchmark</span>
                        <span className="font-bold">₵{packageData.valuePrice?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>

                    <div className="border-t pt-3 space-y-3">
                      <div className="flex justify-between text-sm sm:text-base">
                        <span>Package Base Price</span>
                        <span className="font-bold">₵{packageData.basePrice.toFixed(2)}</span>
                      </div>

                      {hasAdjustment && (
                        <div className={`rounded-lg p-3 ${isDiscount ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <FiAlertCircle className={`w-4 h-4 ${isDiscount ? 'text-green-600' : 'text-yellow-600'}`} />
                              <span className={`font-semibold ${isDiscount ? 'text-green-800' : 'text-yellow-800'}`}>
                                {isDiscount ? 'Price Discount' : 'Extra Charge'}
                              </span>
                            </div>
                            <span className={`font-bold ${isDiscount ? 'text-green-800' : 'text-yellow-800'}`}>
                              {isDiscount ? '-' : '+'}₵{Math.abs(priceAdjustment).toFixed(2)}
                            </span>
                          </div>
                          <p className="text-xs mt-1">
                            {isDiscount 
                              ? 'Items are below package benchmark' 
                              : 'Items exceed package benchmark'}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between text-green-600 text-sm sm:text-base">
                        <span>Delivery</span>
                        <span className="font-bold">FREE</span>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-lg sm:text-xl lg:text-2xl font-bold">
                          <span>Total to Pay</span>
                          <span className="text-[#228B22]">₵{finalPrice.toFixed(2)}</span>
                        </div>
                        {hasAdjustment && (
                          <p className="text-right text-xs text-gray-500 mt-2">
                            (Base: ₵{packageData.basePrice} {isDiscount ? '-' : '+'} ₵{Math.abs(priceAdjustment).toFixed(2)})
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <FiTruck className="w-5 h-5 text-green-700" />
                      <div>
                        <p className="font-bold text-sm">Next Delivery: Saturday</p>
                        <p className="text-xs text-gray-600">Order before Thursday 11:59 PM</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleProceed}
                    disabled={basketItems.length === 0}
                    className={`
                      w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-white flex items-center justify-center gap-2 sm:gap-3 transition-all
                      ${basketItems.length === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#FF7F00] to-[#CC6600] hover:shadow-lg hover:-translate-y-0.5 shadow-md'
                      }
                    `}
                  >
                    <FiCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Proceed to Checkout</span>
                    <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  {basketItems.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-center">
                      <p className="text-yellow-800 text-xs sm:text-sm flex items-center justify-center gap-2">
                        <FiInfo className="w-4 h-4" />
                        Add at least one item to continue
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizePage;