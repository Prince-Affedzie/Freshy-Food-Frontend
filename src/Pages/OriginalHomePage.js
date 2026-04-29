// FreshyFoodLanding.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// SVG Icons Component (no external dependencies needed)
const Icons = {
  Logo: () => (
    <svg viewBox="0 0 40 40" className="w-8 h-8 md:w-10 md:h-10" fill="none">
      <rect width="40" height="40" rx="12" fill="url(#logoGradient)" />
      <path d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20C28 20 26 26 20 28C14 26 12 20 12 20Z" fill="white" fillOpacity="0.2"/>
      <circle cx="20" cy="20" r="4" fill="white"/>
      <defs>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#F97316"/>
          <stop offset="1" stopColor="#EF4444"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  Apple: () => (
    <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 16.97 3.06997 12.51 5.06997 9.52C6.16997 8.06 7.78997 7.17 9.52997 7.15C10.84 7.13 12.02 8.03 12.83 8.03C13.63 8.03 15.09 6.98 16.69 7.12C17.43 7.15 19.38 7.48 20.57 9.31C19.4 10.07 18.58 11.37 18.71 13.01C18.86 14.98 20.6 15.86 21.5 16.31C21.19 17.05 20.53 18.18 19.68 19.31"/>
    </svg>
  ),
  GooglePlay: () => (
    <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M3.609 1.814L13.8 12 3.61 22.186C3.22 22.048 3 21.675 3 21.25V2.75C3 2.325 3.22 1.952 3.609 1.814ZM16.5 12L13.8 9.3L4.5 0.075C4.9 -0.025 5.4 -0.025 6 0.3L19.5 8.1C20.1 8.4 20.4 9 20.4 9.6C20.4 10.2 20.1 10.8 19.5 11.1L6 18.9C5.4 19.2 4.9 19.2 4.5 19.1L13.8 14.7L16.5 12Z"/>
    </svg>
  ),
  Star: () => (
    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13L9 17L19 7"/>
    </svg>
  ),
  Clock: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
    </svg>
  ),
  Shield: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12L11 14L15 10M20.6179 5.98434C20.4132 5.99472 20.2072 5.99997 20 5.99997C16.9265 5.99997 14.123 4.8445 11.9999 2.94434C9.87691 4.8445 7.07339 5.99997 4 5.99997C3.79277 5.99997 3.58678 5.99472 3.38213 5.98434C3.1327 6.94755 3 7.95642 3 8.99997C3 14.5915 6.82432 19.2891 12 20.622C17.1757 19.2891 21 14.5915 21 8.99997C21 7.95642 20.8673 6.94755 20.6179 5.98434Z"/>
    </svg>
  ),
  Truck: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6C13 5.44772 12.5523 5 12 5H4C3.44772 5 3 5.44772 3 6V16C3 16.5523 3.44772 17 4 17H5M13 16C13 16.5523 13.4477 17 14 17H15M13 16L13 8C13 7.44772 13.4477 7 14 7H16.5858C16.851 7 17.1054 7.10536 17.2929 7.29289L20.7071 10.7071C20.8946 10.8946 21 11.149 21 11.4142V16C21 16.5523 20.5523 17 20 17H19M5 17C5 18.1046 5.89543 19 7 19C8.10457 19 9 18.1046 9 17M5 17C5 15.8954 5.89543 15 7 15C8.10457 15 9 15.8954 9 17M15 17C15 18.1046 15.8954 19 17 19C18.1046 19 19 18.1046 19 17M15 17C15 15.8954 15.8954 15 17 15C18.1046 15 19 15.8954 19 17"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8L21 12M21 12L17 16M21 12H3"/>
    </svg>
  ),
  Play: () => (
    <svg className="w-8 h-8 md:w-12 md:h-12" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5V19L19 12L8 5Z"/>
    </svg>
  ),
  Quote: () => (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" opacity="0.1">
      <path d="M14.017 21V14.017C14.017 10.205 13.083 7.9 10.967 5.15L7.35 7.9C8.95 9.8 9.617 11.083 9.617 13.35H4.5V21H14.017ZM23.517 21V14.017C23.517 10.205 22.583 7.9 20.467 5.15L16.85 7.9C18.45 9.8 19.117 11.083 19.117 13.35H14V21H23.517Z"/>
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6H20M4 12H20M4 18H20"/>
    </svg>
  ),
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6L18 18"/>
    </svg>
  )
};

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const SectionTitle = ({ overline, title, description, light = false }) => (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
      className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
    >
      <span className={`text-sm font-semibold tracking-widest uppercase ${light ? 'text-orange-300' : 'text-orange-500'}`}>
        {overline}
      </span>
      <h2 className={`mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight ${light ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-6 text-lg md:text-xl leading-relaxed ${light ? 'text-gray-300' : 'text-gray-600'}`}>
          {description}
        </p>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-white antialiased">
      
      {/* ━━━━━━━━━━━━━━━━━━━━━ NAVIGATION ━━━━━━━━━━━━━━━━━━━━━ */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3 group">
              <Icons.Logo />
              <span className="text-xl md:text-2xl font-bold tracking-tight">
                <span className="text-gray-900">Freshy</span>
                <span className="text-orange-500">Food</span>
              </span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {['How It Works', 'Features', 'Testimonials', 'Pricing'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-orange-500 hover:after:w-full after:transition-all"
                >
                  {item}
                </a>
              ))}
              <a 
                href="#download"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all hover:shadow-lg hover:shadow-gray-900/20"
              >
                Download App
                <Icons.ArrowRight />
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-100"
            >
              <div className="px-4 py-6 space-y-4">
                {['How It Works', 'Features', 'Testimonials', 'Pricing'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-base font-medium text-gray-600 hover:text-gray-900 py-2"
                  >
                    {item}
                  </a>
                ))}
                <a
                  href="#download"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full text-base font-semibold w-full hover:bg-gray-800 transition-all"
                >
                  Download App
                  <Icons.ArrowRight />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ━━━━━━━━━━━━━━━━━━━━━ HERO SECTION ━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-rose-50" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.015]" 
             style={{ 
               backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
               backgroundSize: '40px 40px'
             }} 
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerChildren}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm mb-8">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-gray-700">Now serving in 15+ cities</span>
              </motion.div>

              <motion.h1 
                variants={fadeInUp}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]"
              >
                Delicious meals,
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  delivered fast.
                </span>
              </motion.h1>

              <motion.p 
                variants={fadeInUp}
                className="mt-6 text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0"
              >
                Skip the cooking, skip the wait. Get restaurant-quality food delivered to your door in under 30 minutes.
              </motion.p>

              <motion.div 
                variants={fadeInUp}
                className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
              >
                <a 
                  href="#download"
                  className="group inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl text-base font-semibold hover:bg-gray-800 transition-all hover:shadow-xl hover:shadow-gray-900/20 w-full sm:w-auto justify-center"
                >
                  <Icons.Apple />
                  <span>App Store</span>
                </a>
                <a 
                  href="#download"
                  className="group inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-2xl text-base font-semibold border-2 border-gray-200 hover:border-gray-900 transition-all w-full sm:w-auto justify-center"
                >
                  <Icons.GooglePlay />
                  <span>Google Play</span>
                </a>
              </motion.div>

              <motion.div 
                variants={fadeInUp}
                className="mt-8 flex items-center gap-6 justify-center lg:justify-start"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Icons.Star key={i} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="font-semibold text-gray-700">4.9</span> • 10,000+ reviews
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - App Preview */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative mx-auto w-72 xl:w-80">
                {/* Glow Effect */}
                <div className="absolute -inset-10 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl" />
                
                {/* Phone Frame */}
                <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                  <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                    {/* Status Bar */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
                      <div className="flex items-center justify-between text-white">
                        <span className="text-xs font-semibold">9:41</span>
                        <div className="flex gap-1">
                          <div className="w-4 h-3 border border-white/30 rounded-sm"></div>
                          <div className="w-1.5 h-3 bg-white rounded-sm"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* App Content */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-base font-bold">FreshyFood</span>
                        <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                      </div>

                      <div className="relative mb-4">
                        <div className="w-full h-10 bg-gray-100 rounded-xl"></div>
                      </div>

                      <div className="flex gap-2 mb-6">
                        {['All', 'Popular', 'Nearby', 'New'].map((tab, i) => (
                          <div key={tab} className={`px-4 py-2 rounded-full text-xs font-semibold ${i === 1 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                            {tab}
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        {[
                          { name: 'Jollof Rice & Chicken', price: '₦2,500', time: '25 min', color: 'from-orange-400 to-orange-500' },
                          { name: 'Shawarma Platter', price: '₦3,000', time: '20 min', color: 'from-red-400 to-red-500' },
                          { name: 'Egusi & Pounded Yam', price: '₦2,800', time: '30 min', color: 'from-amber-400 to-amber-500' },
                        ].map((item, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex-shrink-0`} />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold truncate">{item.name}</h4>
                              <p className="text-xs text-gray-500">{item.time}</p>
                            </div>
                            <span className="text-sm font-bold">{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━ TRUST BAR ━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-12 border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '50K+', label: 'Active Users' },
              { number: '1M+', label: 'Meals Delivered' },
              { number: '500+', label: 'Restaurants' },
              { number: '24min', label: 'Avg Delivery' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="mt-2 text-sm md:text-base text-gray-500 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━ PROBLEM/SOLUTION ━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="how-it-works" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            overline="The Problem"
            title="Tired of the same food routine?"
            description="We get it. Between work, family, and life, cooking feels like a chore. That's why we built FreshyFood."
          />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {[
              {
                title: 'No Time to Cook',
                problem: 'Long days leave you exhausted. Cooking is the last thing on your mind.',
                solution: 'Fresh meals in under 30 minutes',
                gradient: 'from-orange-400 to-orange-500'
              },
              {
                title: 'Boring Repetitive Meals',
                problem: 'The same dishes on repeat. Your taste buds are bored.',
                solution: '100+ rotating menu items daily',
                gradient: 'from-red-400 to-red-500'
              },
              {
                title: 'Long Wait Times',
                problem: 'Hungry and waiting 60+ minutes for delivery? Unacceptable.',
                solution: 'Real-time tracking, hot & fresh',
                gradient: 'from-amber-400 to-amber-500'
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 text-white`}>
                  <Icons.Clock />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{item.problem}</p>
                
                <div className="flex items-center gap-2 text-sm font-semibold text-green-600 pt-4 border-t border-gray-100">
                  <Icons.Check />
                  <span>{item.solution}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━ FEATURES ━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="features" className="py-20 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            overline="Why FreshyFood"
            title="Everything you need, nothing you don't."
            description="We focused on what matters: speed, quality, and reliability."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { icon: Icons.Truck, title: 'Express Delivery', description: 'Priority handling for every order. Hot food, fast.' },
              { icon: Icons.Shield, title: 'Quality Guarantee', description: 'Not satisfied? Instant refund. No questions asked.' },
              { icon: Icons.Clock, title: 'Real-Time Tracking', description: 'Watch your food journey from kitchen to door.' },
              { icon: Icons.Check, title: 'Verified Vendors', description: 'Every restaurant is quality-checked and approved.' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 text-orange-500">
                  <feature.icon />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━ TESTIMONIALS ━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="testimonials" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            overline="Testimonials"
            title="Loved by thousands."
            description="Here's what our customers have to say about FreshyFood."
          />

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Amara O.',
                role: 'Lagos, Nigeria',
                text: 'FreshyFood completely changed my evenings. I come home, order, and within 25 minutes I have amazing food. The variety is incredible!',
                rating: 5
              },
              {
                name: 'David M.',
                role: 'Abuja, Nigeria',
                text: 'As a busy professional, I used to skip meals or eat junk. Now I eat like a king every day. The app is so smooth and the tracking feature is brilliant.',
                rating: 5
              },
              {
                name: 'Blessing E.',
                role: 'Port Harcourt, Nigeria',
                text: 'With three kids, cooking was a nightmare. FreshyFood gives us variety and most importantly - TIME. The kids love it, we love it. Game changer!',
                rating: 5
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative"
              >
                <Icons.Quote />
                <div className="flex gap-1 mb-4 mt-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Icons.Star key={j} />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">"{testimonial.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━ CTA SECTION ━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="download" className="py-20 md:py-32 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-orange-500 rounded-full filter blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500 rounded-full filter blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionTitle
            overline="Get Started"
            title="Ready to transform your meals?"
            description="Download FreshyFood today and get 50% off your first month. Offer ends soon."
            light
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          >
            <a 
              href="https://apps.apple.com/app/freshyfood"
              className="group inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-2xl text-base font-semibold hover:bg-gray-50 transition-all hover:shadow-2xl w-full sm:w-auto justify-center"
            >
              <Icons.Apple />
              <div className="text-left">
                <div className="text-xs opacity-70">Download on the</div>
                <div className="text-lg font-bold">App Store</div>
              </div>
            </a>
            <a 
              href="https://play.google.com/store/apps/details?id=com.freshyfood"
              className="group inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-2xl text-base font-semibold hover:bg-gray-50 transition-all hover:shadow-2xl w-full sm:w-auto justify-center"
            >
              <Icons.GooglePlay />
              <div className="text-left">
                <div className="text-xs opacity-70">Get it on</div>
                <div className="text-lg font-bold">Google Play</div>
              </div>
            </a>
          </motion.div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-gray-400">
            <div className="flex items-center gap-2">
              <Icons.Shield />
              <span className="text-sm">Secure & Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Icons.Star key={i} />
                ))}
              </div>
              <span className="text-sm">4.9 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Free delivery on first order</span>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━ FOOTER ━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Icons.Logo />
                <span className="text-xl font-bold">
                  <span className="text-gray-900">Freshy</span>
                  <span className="text-orange-500">Food</span>
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
                Making delicious food accessible to everyone. Because life's too short for boring meals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <div className="space-y-3">
                {['How it Works', 'Features', 'Pricing', 'Download'].map((item) => (
                  <a key={item} href="#" className="block text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    {item}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <div className="space-y-3">
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <a key={item} href="#" className="block text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2024 FreshyFood. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;