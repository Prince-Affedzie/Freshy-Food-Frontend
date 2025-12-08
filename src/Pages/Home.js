// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiCheck, 
  FiTruck, 
  FiPackage, 
  FiUserCheck, 
  FiStar, 
  FiShoppingBag,
  FiCalendar,
  FiChevronRight,
  FiHeart,
  FiShield,
  FiClock,
  FiArrowRight,
  FiDroplet,
  FiSun,
  FiHome,
  FiSmile,
  FiLoader
} from 'react-icons/fi';
import { getAllProducts } from '../Apis/productApi';

// Brand Colors
const brandColors = {
  forestGreen: {
    light: '#90EE90',    // Light green for backgrounds
    DEFAULT: '#228B22',  // Primary forest green
    dark: '#006400',     // Dark forest green
  },
  orange: {
    light: '#FFD580',    // Light orange
    DEFAULT: '#FF7F00',  // Primary orange
    dark: '#CC6600',     // Dark orange
  }
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getAllProducts();
        
        if (response.status === 200 && response.data) {
          // Filter for featured or in-stock products
          const featuredProducts = response.data.data
            .filter(product => product.isAvailable && product.countInStock > 0)
            .slice(0, 8); // Show top 8 products
          
          setProducts(featuredProducts);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const features = [
    {
      icon: <FiPackage className="w-6 h-6" />,
      title: "Choose Your Package",
      description: "Select from Small, Medium, or Family baskets based on your household needs",
      color: `text-[${brandColors.forestGreen.DEFAULT}] bg-[${brandColors.forestGreen.light}]`
    },
    {
      icon: <FiCheck className="w-6 h-6" />,
      title: "Customize Your Basket",
      description: "Add, remove, or swap items to perfectly match your preferences",
      color: `text-[${brandColors.orange.DEFAULT}] bg-orange-50`
    },
    {
      icon: <FiTruck className="w-6 h-6" />,
      title: "Saturday Delivery",
      description: "Fresh produce delivered directly to your doorstep every Saturday",
      color: `text-[${brandColors.forestGreen.dark}] bg-emerald-50`
    },
    {
      icon: <FiUserCheck className="w-6 h-6" />,
      title: "Trusted Farmers",
      description: "Directly sourced from reliable farmers including family farms",
      color: `text-[${brandColors.orange.dark}] bg-amber-50`
    }
  ];

  // Helper function to get emoji based on category
  const getEmojiForCategory = (category) => {
    const emojiMap = {
      'vegetables': '🥦',
      'fruits': '🍎',
      'leafy greens': '🥬',
      'staples': '🍚',
      'grains': '🌾',
      'oils': '🫒',
      'spices': '🌶️',
      'herbs': '🌿',
      'tropical': '🍌',
      'root vegetables': '🥔',
      'default': '🥕'
    };
    
    const lowerCategory = category?.toLowerCase() || '';
    return emojiMap[lowerCategory] || emojiMap.default;
  };

  // Helper function to get color based on category
  const getColorForCategory = (category) => {
    const colorMap = {
      'vegetables': 'bg-red-100 text-red-700',
      'fruits': 'bg-yellow-100 text-yellow-700',
      'leafy greens': 'bg-green-100 text-green-700',
      'staples': 'bg-amber-100 text-amber-700',
      'grains': 'bg-yellow-50 text-yellow-800',
      'oils': 'bg-orange-100 text-orange-700',
      'default': 'bg-gray-100 text-gray-700'
    };
    
    const lowerCategory = category?.toLowerCase() || '';
    return colorMap[lowerCategory] || colorMap.default;
  };

  const testimonials = [
    {
      text: "Best decision I made this year! No more market stress on weekends.",
      author: "Mrs. Adebayo",
      location: "Lekki",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      accent: "bg-[#228B22]"
    },
    {
      text: "The vegetables last longer and taste better than supermarket produce.",
      author: "Chioma",
      location: "Surulere",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      accent: "bg-[#FF7F00]"
    },
    {
      text: "My family eats more veggies now because it's so convenient!",
      author: "Funmi",
      location: "Ikeja",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      accent: "bg-[#228B22]"
    }
  ];

  const benefits = [
    {
      icon: <FiDroplet className="w-6 h-6" />,
      title: "Fresh From Farm",
      description: "Harvested within 24 hours of delivery",
      bgColor: "bg-[#90EE90]",
      iconColor: "text-[#006400]"
    },
    {
      icon: <FiShield className="w-6 h-6" />,
      title: "Quality Assured",
      description: "Every item inspected and cleaned",
      bgColor: "bg-orange-50",
      iconColor: "text-[#CC6600]"
    },
    {
      icon: <FiClock className="w-6 h-6" />,
      title: "Save Time",
      description: "No more market runs on weekends",
      bgColor: "bg-[#90EE90]",
      iconColor: "text-[#006400]"
    },
    {
      icon: <FiHeart className="w-6 h-6" />,
      title: "Healthy Living",
      description: "Fresh produce for nutritious meals",
      bgColor: "bg-orange-50",
      iconColor: "text-[#CC6600]"
    }
  ];

  const stats = [
    { number: "500+", label: "Happy Families", icon: <FiHome className="w-4 h-4" /> },
    { number: "98%", label: "Freshness Guarantee", icon: <FiStar className="w-4 h-4" /> },
    { number: "24h", label: "Farm to Door", icon: <FiClock className="w-4 h-4" /> },
    { number: "50+", label: "Local Farmers", icon: <FiUserCheck className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0FFF0]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        
        {/* Forest-inspired background with leaves */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-white/60"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
              opacity: 0.7
            }}
          ></div>
        </div>
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#228B22]/20 shadow-sm mb-6">
                <FiDroplet className="w-4 h-4 text-[#228B22]" />
                <span className="text-sm font-semibold text-[#228B22]">
                  🌱 Farm Fresh, City Delivered
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
                Fresh Food From
                <span className="block mt-2">
                  <span className="text-[#228B22]">Farm</span>
                  <span className="text-gray-900 mx-2">to</span>
                  <span className="text-[#FF7F00]">Your Table</span>
                </span>
              </h1>
              
              <p className="mt-6 text-lg sm:text-xl text-gray-100 leading-relaxed">
                Weekly deliveries of fresh vegetables, fruits, and staple foods 
                sourced directly from trusted farmers. Clean, packaged, and delivered 
                to your doorstep every Saturday.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/packages"
                  className="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-[#228B22] to-[#006400] rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 border border-[#228B22]/20"
                >
                  <FiShoppingBag className="mr-3 w-5 h-5" />
                  Choose Your Package
                  <FiArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  to="/contact"
                  className="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-[#FF7F00] to-[#CC6600] rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 border border-[#FF7F00]/20"
                >
                  <FiSun className="mr-3 w-5 h-5" />
                  Start Free Trial
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-lg">
                {stats.map((stat, index) => (
                  <div key={index} className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <div className="text-[#228B22]">{stat.icon}</div>
                      <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image */}
            <div className="mt-12 lg:mt-0">
              <div className="relative">
                {/* Orange accent border */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#FF7F00]/20 to-[#228B22]/20 rounded-3xl blur-xl opacity-50"></div>
                
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                  <div className="p-6">
                    <div className="relative h-64 rounded-xl overflow-hidden mb-6">
                      <img 
                        src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                        alt="Fresh Vegetables"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-sm font-semibold text-[#228B22]">
                          <FiStar className="w-3 h-3 fill-current" />
                          Featured This Week
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">This Week's Fresh Pick</h3>
                        <p className="text-sm text-gray-600">Order by Thursday for Saturday delivery</p>
                      </div>
                     
                    </div>
                    
                    <Link 
                      to="/packages" 
                      className="mt-4 inline-flex items-center justify-center w-full py-3 bg-gradient-to-r from-[#FF7F00]/10 to-[#228B22]/10 text-[#228B22] font-semibold rounded-lg hover:from-[#FF7F00]/20 hover:to-[#228B22]/20 transition-all duration-300 group"
                    >
                      View Packages 
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
      <div className="bg-gradient-to-r from-[#228B22]/5 via-white to-[#FF7F00]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="relative group">
                <div className={`absolute inset-0 ${benefit.bgColor} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg`}></div>
                <div className="relative bg-white rounded-xl p-6 shadow-sm border border-gray-100 group-hover:border-[#228B22]/20 group-hover:shadow-md transition-all duration-300">
                  <div className={`w-14 h-14 rounded-xl ${benefit.bgColor} flex items-center justify-center mb-4`}>
                    <div className={benefit.iconColor}>{benefit.icon}</div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF7F00]/10 border border-[#FF7F00]/20 mb-4">
              <FiSun className="w-4 h-4 text-[#FF7F00]" />
              <span className="text-sm font-semibold text-[#FF7F00]">Simple & Convenient</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting fresh, farm-to-table produce has never been easier
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
            {/* Steps */}
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div key={index} className="relative group">
                  <div className="flex items-start gap-6">
                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${index % 2 === 0 ? 'bg-[#90EE90] text-[#228B22]' : 'bg-orange-100 text-[#FF7F00]'} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {feature.title}
                        </h3>
                      </div>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  {index < features.length - 1 && (
                    <div className="absolute left-7 top-14 bottom-0 w-0.5 bg-gradient-to-b from-[#228B22]/20 to-[#FF7F00]/20"></div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Image */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#228B22]/10 to-[#FF7F00]/10 rounded-3xl blur-xl"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="Fresh vegetable basket"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                      <FiTruck className="w-6 h-6 text-[#228B22]" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Weekly Delivery</div>
                      <div className="text-sm text-white/90">Every Saturday Morning</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Items Section */}
      <section className="py-20 bg-gradient-to-b from-white to-[#F0FFF0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#228B22]/10 border border-[#228B22]/20 mb-4">
              <FiDroplet className="w-4 h-4 text-[#228B22]" />
              <span className="text-sm font-semibold text-[#228B22]">Seasonal Selection</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Farm-Fresh Selection
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every week, your basket is packed with the season's best produce
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin w-16 h-16 border-4 border-[#228B22] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading fresh products...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <FiLoader className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🥦</div>
              <p className="text-gray-600">No products available at the moment.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div 
                    key={product._id} 
                    className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                  >
                    <div className="h-40 overflow-hidden">
                      {product.image ? (
                        <img 
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl bg-gray-100">
                          {product.name[0]}
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getColorForCategory(product.category)}`}>
                          {product.category || 'Product'}
                        </span>
                      </div>
                      {!product.isAvailable && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        {/*<div className="text-2xl">
                          {getEmojiForCategory(product.category)}
                        </div>*/}
                        <div>
                          <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
                          {product.unit && (
                            <p className="text-xs text-gray-500">{product.unit}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FiStar className="w-3 h-3 text-[#FF7F00] fill-current" />
                          <span className="text-xs text-gray-500">
                            {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-[#228B22]">
                            ₵{product.price?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                      </div>
                      <Link 
                        to={`/products/${product._id}`}
                        className="mt-3 block text-center text-sm font-medium text-[#228B22] hover:text-[#006400] hover:underline py-2"
                      >
                        View Details
                      </Link>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#228B22] to-[#FF7F00] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link
                  to="/products"
                  className="inline-flex items-center text-[#228B22] hover:text-[#006400] font-bold group"
                >
                  Explore All Available Items
                  <FiChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF7F00]/10 border border-[#FF7F00]/20 mb-4">
              <FiSmile className="w-4 h-4 text-[#FF7F00]" />
              <span className="text-sm font-semibold text-[#FF7F00]">Loved by Families</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join hundreds of happy families enjoying fresh, convenient deliveries
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#228B22]/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div className={`absolute top-0 left-8 w-16 h-1 ${testimonial.accent} transform -translate-y-1/2`}></div>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <img 
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${testimonial.accent} rounded-full border-2 border-white flex items-center justify-center`}>
                      <FiStar className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.location}</div>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 text-[#FF7F00] fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 italic leading-relaxed mb-6">
                  "{testimonial.text}"
                </p>
                
                <div className="pt-6 border-t border-gray-100">
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <FiCalendar className="w-4 h-4" />
                    Weekly customer since March 2024
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Schedule */}
      <section className="relative py-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#228B22] via-[#1E7A1E] to-[#006400]"></div>
          {/* Orange accent overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF7F00]/10 to-transparent"></div>
          
          {/* Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
          </div>
          
          {/* Floating items */}
          <div className="absolute top-10 right-10 animate-float">
            <div className="text-4xl text-white/20">🥦</div>
          </div>
          <div className="absolute bottom-20 left-20 animate-float-slow">
            <div className="text-5xl text-white/20">🍅</div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                <FiCalendar className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">Weekly Schedule</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Delivery Schedule
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-xl">
                Fresh produce follows a carefully planned journey from farm to your table
              </p>
              
              <div className="space-y-4">
                {[
                  { day: "Monday - Thursday", task: "Place & customize your order", color: "bg-white" },
                  { day: "Friday", task: "Harvest & pack fresh from farms", color: "bg-[#FF7F00]" },
                  { day: "Saturday", task: "Home delivery (8AM - 2PM)", color: "bg-white" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className={`w-12 h-12 rounded-full ${item.color} ${item.color === 'bg-white' ? 'text-[#228B22]' : 'text-white'} flex items-center justify-center font-bold text-lg`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{item.day}</div>
                      <div className="text-white/80">{item.task}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule Card */}
            <div className="mt-12 lg:mt-0">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#FF7F00]/30 to-[#228B22]/30 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-6">
                    <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden mb-4">
                      <img 
                        src="https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                        alt="Fresh delivery"
                        className="w-full h-64 object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900">Next Delivery Slot</h3>
                        <p className="text-sm text-gray-600">Saturday, Dec 9th</p>
                      </div>
                      <div className="px-4 py-2 bg-gradient-to-r from-[#228B22] to-[#006400] text-white rounded-full text-sm font-bold">
                        Available
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Cut-off time:</span>
                        <span className="font-semibold">Thursday, 8 PM</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Delivery window:</span>
                        <span className="font-semibold">8 AM - 2 PM</span>
                      </div>
                    </div>
                    <button className="mt-6 w-full py-3 bg-gradient-to-r from-[#FF7F00] to-[#CC6600] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300">
                      Reserve Your Slot
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            {/* Background with brand colors */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#228B22]/5 via-white to-[#FF7F00]/5"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#228B22]/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#FF7F00]/10 to-transparent rounded-full translate-y-48 -translate-x-48"></div>
            
            <div className="relative lg:grid lg:grid-cols-2">
              <div className="p-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#228B22]/20 shadow-sm mb-6">
                  <FiStar className="w-4 h-4 text-[#228B22]" />
                  <span className="text-sm font-semibold text-[#228B22]">Start Today</span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Ready for Fresh Weekly Deliveries?
                </h2>
                <p className="text-lg text-gray-700 mb-10 max-w-xl">
                  Choose a package, customize your basket, and get started today. 
                  Join our community of happy families eating fresh, healthy meals every week.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/packages"
                    className="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-[#228B22] to-[#006400] rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <FiShoppingBag className="mr-3 w-5 h-5" />
                    View Packages & Prices
                    <FiArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link
                    to="/contact"
                    className="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-[#FF7F00] bg-white border-2 border-[#FF7F00] rounded-xl hover:bg-[#FF7F00] hover:text-white transition-all duration-300"
                  >
                    <FiSun className="mr-3 w-5 h-5" />
                    Have Questions?
                  </Link>
                </div>
                
                <div className="mt-8 flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-[#228B22]" />
                    <span>No subscription lock-in</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-[#228B22]" />
                    <span>Skip or cancel anytime</span>
                  </div>
                </div>
              </div>
              
              <div className="relative hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent z-10"></div>
                <img 
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Fresh food basket"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-6 right-6 z-20">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg max-w-xs">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[#90EE90] flex items-center justify-center">
                        <FiHeart className="w-5 h-5 text-[#006400]" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">100% Fresh Guarantee</div>
                        <div className="text-xs text-gray-600">Or your money back</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add floating animation styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: float-slower 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;