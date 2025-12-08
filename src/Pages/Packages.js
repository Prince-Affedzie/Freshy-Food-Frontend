// src/pages/PackagesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiCalendar, FiTruck, FiHelpCircle, FiCheck, FiStar, 
  FiChevronDown, FiChevronUp, FiUsers, FiPackage, 
  FiShoppingBag, FiArrowRight, FiSun, FiHeart, 
  FiShield, FiClock, FiMessageCircle, FiRefreshCw,
  FiPlus, FiHome, FiDroplet, FiChevronRight
} from 'react-icons/fi';
import { getAllPackages } from '../Apis/packageApi';

const PackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await getAllPackages();
        if (response.data.success) {
          // Sort to show recommended/popular first if needed
          const sorted = response.data.data.sort((a, b) => 
            b.totalItems - a.totalItems || b.name.localeCompare(a.name)
          );
          setPackages(sorted);
        }
      } catch (err) {
        setError("Failed to load packages. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const faqs = [
    {
      question: "How does customization work?",
      answer: "After selecting a package, you'll enter a customization page where you can swap items, adjust quantities, or add extra items. You'll see the exact price changes in real-time."
    },
    {
      question: "When will I receive my delivery?",
      answer: "All orders are delivered every Saturday between 8 AM and 2 PM. Order cutoff is Thursday at 8 PM."
    },
    {
      question: "Can I skip a week?",
      answer: "Yes! You can skip any week with no penalty. Just make sure to skip before Thursday's cutoff time."
    },
    {
      question: "What if I'm not satisfied with an item?",
      answer: "We offer a 100% freshness guarantee. If you're not happy with any item, we'll refund you for that item."
    },
    {
      question: "How are the packages priced?",
      answer: "Packages have a base price and value benchmark. If your customizations exceed the benchmark value, you pay the difference. If you're under, you get a discount up to our profit margin."
    }
  ];

  const benefits = [
    {
      icon: <FiPlus className="w-5 h-5" />,
      title: "Farm Fresh",
      description: "Harvested within 24 hours of delivery"
    },
    {
      icon: <FiShield className="w-5 h-5" />,
      title: "Quality Assured",
      description: "Every item inspected for freshness"
    },
    {
      icon: <FiClock className="w-5 h-5" />,
      title: "Save Time",
      description: "No more weekend market runs"
    },
    {
      icon: <FiHeart className="w-5 h-5" />,
      title: "Healthy Living",
      description: "Fresh produce for nutritious meals"
    }
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Loading skeleton card
  const SkeletonCard = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded-full w-32 mb-4"></div>
      <div className="h-64 bg-gray-200 rounded-2xl"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0FFF0]">

      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#228B22] via-[#1E7A1E] to-[#006400]">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-r from-[#FF7F00]/20 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-10 left-10 animate-float">
          <div className="text-4xl text-white/20">🥦</div>
        </div>
        <div className="absolute top-20 right-20 animate-float-slow">
          <div className="text-5xl text-white/20">🍅</div>
        </div>
        <div className="absolute bottom-20 left-1/4 animate-float">
          <div className="text-3xl text-white/20">🥬</div>
        </div>
        <div className="absolute bottom-32 right-1/4 animate-float-slow">
          <div className="text-4xl text-white/20">🥕</div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                <FiPackage className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">
                  🌱 Fresh Packages
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                Customize Your
                <span className="block mt-2">
                  <span className="text-[#FFD580]">Weekly</span>
                  <span className="mx-3">Fresh</span>
                  <span className="text-[#FF7F00]">Basket</span>
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed max-w-xl lg:max-w-2xl">
                Choose from carefully curated packages, then customize every item to match your family's preferences. 
                Fresh from farm, delivered to your doorstep every Saturday.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 max-w-lg lg:max-w-xl">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-sm text-white/80">Fresh Guarantee</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white">24h</div>
                  <div className="text-sm text-white/80">Farm to Door</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white">50+</div>
                  <div className="text-sm text-white/80">Swap Options</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white">Free</div>
                  <div className="text-sm text-white/80">Saturday Delivery</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="#packages"
                  className="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-[#FF7F00] to-[#CC6600] rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 border border-[#FF7F00]/20"
                >
                  <FiShoppingBag className="mr-3 w-5 h-5" />
                  View All Packages
                  <FiChevronDown className="ml-3 w-5 h-5 group-hover:translate-y-1 transition-transform" />
                </a>
                
                <Link
                  to="/how-it-works"
                  className="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-transparent border-2 border-white rounded-xl hover:bg-white/10 transition-all duration-300"
                >
                  <FiHelpCircle className="mr-3 w-5 h-5" />
                  How It Works
                </Link>
              </div>
            </div>

            {/* Right Image/Content */}
            <div className="mt-12 lg:mt-0">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#FF7F00]/20 to-[#228B22]/20 rounded-3xl blur-xl opacity-50"></div>
                
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                  <div className="p-6">
                    {/* Package Preview */}
                    <div className="relative h-64 rounded-xl overflow-hidden mb-6">
                      <img 
                        src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                        alt="Fresh Vegetable Basket"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-sm font-semibold text-[#228B22]">
                          <FiStar className="w-3 h-3 fill-current" />
                          Featured Package
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <h3 className="text-xl font-bold text-white">Family Essentials</h3>
                        <p className="text-white/90 text-sm">Perfect for 4-5 people</p>
                      </div>
                    </div>
                    
                    {/* Package Features */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#90EE90]/20 flex items-center justify-center">
                            <FiCheck className="w-5 h-5 text-[#228B22]" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">Customizable</div>
                            <div className="text-sm text-gray-600">Swap any item you want</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <FiTruck className="w-5 h-5 text-[#FF7F00]" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">Weekly Delivery</div>
                            <div className="text-sm text-gray-600">Every Saturday</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Link 
                      to="#packages" 
                      className="mt-6 inline-flex items-center justify-center w-full py-3 bg-white text-[#228B22] font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 group"
                    >
                      Explore All Packages
                      <FiChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <div className="bg-gradient-to-r from-[#228B22]/5 via-white to-[#FF7F00]/5 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#228B22]/10 to-[#FF7F00]/10 flex items-center justify-center text-[#228B22]">
                  {benefit.icon}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{benefit.title}</div>
                  <div className="text-sm text-gray-600">{benefit.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Packages Grid - Now Dynamic */}
      <section id="packages" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#228B22]/10 border border-[#228B22]/20 mb-4">
              <FiPackage className="w-4 h-4 text-[#228B22]" />
              <span className="text-sm font-semibold text-[#228B22]">
                {loading ? 'Loading...' : `${packages.length} Fresh Packages`}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Choose Your Perfect Basket
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Fresh, farm-sourced produce delivered every Saturday. Customize after selection.
            </p>
          </div>

          {loading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          )}

          {!loading && !error && packages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No packages available at the moment.</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => {
              const isRecommended = pkg.totalItems >= 10 || pkg.name.toLowerCase().includes('medium');
              const gradientColors = index === 0 
                ? 'from-green-100 to-emerald-100' 
                : index === 1 
                ? 'from-[#228B22]/10 to-[#FF7F00]/10' 
                : 'from-amber-100 to-orange-100';

              const primaryColor = index === 1 ? '#FF7F00' : '#228B22';

              return (
                <div key={pkg.id} className="relative">
                  {/* Recommended Badge */}
                  {isRecommended && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#FF7F00] to-[#CC6600] text-white font-bold rounded-full shadow-lg">
                        <FiStar className="w-4 h-4 fill-current" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className={`relative h-full rounded-2xl overflow-hidden border-2 ${isRecommended ? 'border-[#FF7F00]' : 'border-gray-200'} bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2`}>
                    <div className={`h-2 bg-gradient-to-r ${gradientColors}`}></div>

                    {/* Package Image */}
                    {pkg.image ? (
                      <div className="relative h-48 overflow-hidden bg-gray-50">
                        <img 
                          src={pkg.image} 
                          alt={pkg.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="text-2xl font-bold">{pkg.name}</h3>
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <FiPackage className="w-20 h-20 text-gray-400" />
                      </div>
                    )}

                    <div className="p-6">
                      {/* Price */}
                      <div className="text-center my-6">
                        <div className="text-4xl font-bold text-gray-900">{pkg.priceDisplay}</div>
                        <div className="text-gray-500">per week</div>
                        {isRecommended && (
                          <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FF7F00]/10 text-[#CC6600] text-sm">
                            <FiUsers className="w-3 h-3" />
                            Best value for families
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-gray-700 text-center mb-6 leading-relaxed">
                        {pkg.description || "Fresh, seasonal produce curated for your household."}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-2xl font-bold text-[#228B22]">{pkg.totalItems}</div>
                          <div className="text-xs text-gray-600">Default Items</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-2xl font-bold text-[#FF7F00]">{pkg.totalSwapOptions}</div>
                          <div className="text-xs text-gray-600">Swap Options</div>
                        </div>
                      </div>

                      {/* Sample Items Preview */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FiShoppingBag className="w-4 h-4" />
                          Sample Items
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          {pkg.defaultItems && pkg.defaultItems.slice(0, 6).map((item, i) => (
                            <div key={i} className="group relative">
                              {item.product && item.product.image ? (
                                <img 
                                  src={item.product.image} 
                                  alt={item.product.name}
                                  className="w-full h-20 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                                />
                              ) : (
                                <div className="w-full h-20 bg-gray-200 border-2 border-dashed rounded-lg flex items-center justify-center">
                                  <span className="text-xs text-gray-500">{item.product?.name || 'Item'}</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-medium px-2 text-center">
                                  {item.quantity}x
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {pkg.defaultItems && pkg.defaultItems.length > 6 && (
                          <p className="text-center text-sm text-gray-500 mt-2">
                            + {pkg.defaultItems.length - 6} more items
                          </p>
                        )}
                      </div>

                      {/* Swap Options Preview */}
                      {pkg.totalSwapOptions > 0 && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 text-blue-800 font-medium">
                            <FiRefreshCw className="w-4 h-4" />
                            <span>Customizable</span>
                          </div>
                          <p className="text-sm text-blue-700 mt-1">
                            Swap any {pkg.totalSwapOptions} items with alternatives
                          </p>
                        </div>
                      )}

                      {/* CTA */}
                      <Link
                        to={`/customize/${pkg._id || pkg.id}`}
                        className={`block w-full py-4 text-center font-bold rounded-xl text-white transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
                          isRecommended
                            ? 'bg-gradient-to-r from-[#FF7F00] to-[#CC6600]'
                            : 'bg-gradient-to-r from-[#228B22] to-[#006400]'
                        }`}
                      >
                        Customize This Basket
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Monthly Subscription Card */}
          <div className="mt-16 bg-gradient-to-r from-[#228B22] to-[#006400] rounded-2xl p-8 text-white shadow-xl">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 mb-4">
                  <FiCalendar className="w-4 h-4" />
                  <span className="text-sm font-semibold">Monthly Plan</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Save with Monthly Subscription</h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <FiCheck className="w-5 h-5 text-[#90EE90]" />
                    <span>15% discount on all packages</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheck className="w-5 h-5 text-[#90EE90]" />
                    <span>Priority delivery slots</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheck className="w-5 h-5 text-[#90EE90]" />
                    <span>Free extra items monthly</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheck className="w-5 h-5 text-[#90EE90]" />
                    <span>Skip or cancel anytime</span>
                  </li>
                </ul>
              </div>
              <div className="text-center lg:text-right">
                <div className="text-5xl font-bold mb-2">15% OFF</div>
                <p className="text-white/80 mb-6">on monthly subscription</p>
                <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#228B22] font-bold rounded-xl hover:bg-gray-100 transition-colors">
                  <FiSun className="w-5 h-5" />
                  Subscribe Monthly
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-white to-[#F0FFF0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF7F00]/10 border border-[#FF7F00]/20 mb-4">
              <FiHelpCircle className="w-4 h-4 text-[#FF7F00]" />
              <span className="text-sm font-semibold text-[#FF7F00]">Common Questions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about our packages and delivery
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {activeFaq === index ? (
                    <FiChevronUp className="w-5 h-5 text-[#228B22]" />
                  ) : (
                    <FiChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {activeFaq === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#FF7F00]/5 to-[#228B22]/5 rounded-3xl p-12 text-center border border-gray-200">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Ready to Start Your Fresh Journey?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join hundreds of happy families enjoying fresh, customized deliveries every week.
              </p>
              <Link
                to="#packages"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#228B22] to-[#006400] text-white font-bold rounded-xl hover:shadow-xl transition-all"
              >
                <FiShoppingBag className="w-5 h-5" />
                Choose Your Package Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default PackagesPage;