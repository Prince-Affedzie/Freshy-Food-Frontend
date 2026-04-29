import React, { useState } from "react";
import {
  FaApple,
  FaGooglePlay,
  FaLeaf,
  FaShoppingCart,
  FaStar,
  FaTruck,
  FaCheck,
  FaInstagram,
  FaWhatsapp,
  FaBars,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import deliveryGuy from '../assets/delivery_guy.jpg';

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#e9dccb] font-sans antialiased selection:bg-orange-200/60 overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;1,500&display=swap');
        * { font-family: 'Inter', sans-serif; }

        html { scroll-behavior: smooth; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-float { animation: float 5s ease-in-out infinite; }
        .animate-fade-up { animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; opacity: 0; }
        .animate-fade-up-1 { animation-delay: 0.1s; }
        .animate-fade-up-2 { animation-delay: 0.2s; }
        .animate-fade-up-3 { animation-delay: 0.3s; }
        .animate-scale-in { animation: scaleIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; opacity: 0; }

        .glass {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.7);
        }
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 48px -12px rgba(0,0,0,0.15);
        }

        .btn-primary {
          transition: all 0.25s ease;
        }
        .btn-primary:hover {
          transform: scale(1.03);
          box-shadow: 0 12px 28px -8px rgba(249, 115, 22, 0.4);
        }
        .btn-primary:active {
          transform: scale(0.98);
        }
      `}</style>

      {/* ---------- NAVBAR ---------- */}
      <nav className="fixed top-4 inset-x-0 z-50 mx-auto max-w-6xl px-4">
        <div className="glass rounded-2xl px-6 py-4 flex items-center justify-between shadow-md shadow-black/5">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-md shadow-green-200">
              <FaLeaf className="text-white text-sm" />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">
              FreshyFood Factory<span className="text-green-600"></span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600 font-medium">
            <a href="#home" className="text-orange-500 font-semibold">Home</a>
            <a href="#menu" className="hover:text-orange-500 transition">Menu</a>
            <a href="#about" className="hover:text-orange-500 transition">About</a>
            <a href="#contact" className="hover:text-orange-500 transition">Contact</a>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer">
              <FaShoppingCart className="text-gray-700 text-lg" />
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                0
              </span>
            </div>
            <a
              href="#download"
              className="hidden md:block bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition shadow-lg shadow-gray-200"
            >
              Sign Up
            </a>
            <button
              onClick={toggleMobileMenu}
              className="md:hidden text-gray-700 p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 glass rounded-2xl px-6 py-4 flex flex-col gap-3 shadow-lg">
            {[
              { label: "Home", href: "#home" },
              { label: "Menu", href: "#menu" },
              { label: "About", href: "#about" },
              { label: "Contact", href: "#contact" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={closeMobileMenu}
                className="block py-2 text-base font-medium text-gray-700 hover:text-orange-500 transition"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#download"
              onClick={closeMobileMenu}
              className="mt-2 bg-gray-900 text-white py-2.5 rounded-full text-sm font-semibold w-full text-center"
            >
              Sign Up
            </a>
          </div>
        )}
      </nav>

      {/* ---------- HERO (HOME) ---------- */}
      <section id="home" className="pt-28 pb-6 px-4 max-w-6xl mx-auto animate-scale-in">
        <div className="bg-[#f3eadc] rounded-3xl px-6 sm:px-10 lg:px-14 py-14 lg:py-20 grid md:grid-cols-2 items-center gap-12 lg:gap-16 shadow-xl shadow-black/5 ring-1 ring-white/80">
          
          {/* Left content */}
          <div className="space-y-7">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-semibold text-orange-600 border border-orange-200 shadow-sm">
                <span className="flex gap-0.5 text-amber-400">
                  <FaStar className="text-xs" />
                  <FaStar className="text-xs" />
                  <FaStar className="text-xs" />
                  <FaStar className="text-xs" />
                  <FaStar className="text-xs" />
                </span>
                Grocery Delivery Service
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.08] tracking-tight animate-fade-up animate-fade-up-1">
              Fresh groceries, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-500">
                zero market stress.
              </span>
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed max-w-md animate-fade-up animate-fade-up-2">
              Forget the traffic, long queues, and haggling. Order fresh food, 
              groceries, and everyday essentials straight from your phone. 
              We deliver to your doorstep — quick, affordable, and hassle‑free.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up animate-fade-up-3">
              <a
                href="#download"
                className="btn-primary bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 inline-block text-center"
              >
                Shop Now
              </a>
              <a
                href="#menu"
                className="bg-white border border-gray-200 hover:border-orange-200 text-gray-800 px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:shadow-md inline-block text-center"
              >
                View Menu
              </a>
            </div>

            {/* Download buttons – always side by side on mobile, now with target="_blank" */}
            <div className="pt-4 animate-fade-up animate-fade-up-3">
              <p className="text-sm text-gray-500 mb-4 font-medium">
                For better service download now
              </p>
              <div className="flex items-center gap-2 sm:gap-3">
                <a
                  href="https://play.google.com/store/apps/details?id=com.freshyfood.factory"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 sm:gap-3 bg-gray-900 text-white px-3 sm:px-6 py-3 sm:py-3.5 rounded-2xl font-semibold hover:bg-gray-800 transition-all shadow-md hover:shadow-xl hover:scale-105 text-xs sm:text-base"
                >
                  <FaGooglePlay size={20} className="flex-shrink-0" />
                  <div className="whitespace-nowrap">
                    <div className="text-[10px] uppercase opacity-60">Get it on</div>
                    <div className="text-sm sm:text-base">Google Play</div>
                  </div>
                </a>
                <a
                  href="https://apps.apple.com/app/freshyfood-factory/id6762318566"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 sm:gap-3 bg-gray-900 text-white px-3 sm:px-6 py-3 sm:py-3.5 rounded-2xl font-semibold hover:bg-gray-800 transition-all shadow-md hover:shadow-xl hover:scale-105 text-xs sm:text-base"
                >
                  <FaApple size={20} className="flex-shrink-0" />
                  <div className="whitespace-nowrap">
                    <div className="text-[10px] uppercase opacity-60">Download on the</div>
                    <div className="text-sm sm:text-base">App Store</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Right - Image + floating elements */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={deliveryGuy}
                alt="Fresh groceries delivery"
                className="w-full h-80 md:h-96 lg:h-[440px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>

            {/* Floating card 1 - Top left */}
            <div className="absolute -top-5 -left-8 lg:left-[-50px] glass rounded-2xl px-5 py-4 shadow-xl animate-float">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FaLeaf className="text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">100% Fresh</p>
                  <p className="text-xs text-gray-500">Quality guaranteed</p>
                  <div className="flex mt-1 text-amber-400 text-[10px] gap-0.5">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating card 2 - Bottom left */}
            <div className="absolute -bottom-6 -left-6 lg:left-[-45px] glass rounded-2xl px-5 py-4 shadow-xl flex items-center gap-3 animate-float" style={{ animationDelay: "1s" }}>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <FaTruck className="text-orange-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Fast Delivery</p>
                <p className="text-xs text-gray-500">Free on all orders</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- WHAT WE OFFER (MENU) ---------- */}
      <section id="menu" className="pt-20 pb-10 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-orange-600 text-sm font-bold uppercase tracking-widest bg-orange-100/80 px-5 py-1.5 rounded-full">
            What We Offer
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-4 mb-3">
            Your daily essentials, delivered
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            From farm‑fresh produce to pantry staples — everything you need, without stepping out.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Vegetables", image: "https://res.cloudinary.com/duv3qvvjz/image/upload/v1769990080/vegetables_cpp5n5.jpg", desc: "Handpicked, farm‑fresh daily" },
            { title: "Fruits", image: "https://res.cloudinary.com/duv3qvvjz/image/upload/v1770885485/colorful-fruits-tasty-fresh-ripe-juicy-white-desk_utdxnl.jpg", desc: "Pure, natural, and delivered fast" },
            { title: "Staples", image: "https://res.cloudinary.com/duv3qvvjz/image/upload/v1770886305/staple_food_xlgo92.jpg", desc: "Wide range of fresh grocerries" },
            { title: "Meat", image: "https://res.cloudinary.com/duv3qvvjz/image/upload/v1774443807/freshy-food/products/apsf22fktal9qeryjuyt.webp", desc: "Premium cuts, no market hassle" },
            { title: "Beverages", image: "https://images.unsplash.com/photo-1527960471264-932f39eb5846?q=80&w=600&auto=format&fit=crop", desc: "Stay refreshed, order with ease" },
            { title: "Snacks", image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=600&auto=format&fit=crop", desc: "Tasty treats at your fingertips" }
          ].map((item, idx) => (
            <div key={idx} className="glass rounded-2xl overflow-hidden shadow-md hover-lift group">
              <img src={item.image} alt={item.title} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- ABOUT SECTION ---------- */}
      <section id="about" className="pt-20 pb-10 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-orange-600 text-sm font-bold uppercase tracking-widest bg-orange-100/80 px-5 py-1.5 rounded-full">
            About Us
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-4 mb-3">
            We make grocery shopping effortless
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            FreshyFood Factory was built to save you from market stress. 
            Order fresh food, groceries, and essentials from your phone — no traffic, 
            no queues, no haggling. Just affordable, convenient delivery straight to your door.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <FaTruck className="text-orange-600" />, title: "Same-day delivery", desc: "From our store to your doorstep in hours" },
            { icon: <FaCheck className="text-green-600" />, title: "100% Fresh guarantee", desc: "Not happy? Instant refund" },
            { icon: <FaLeaf className="text-green-600" />, title: "Quality you can trust", desc: "Carefully sourced, always fresh" },
            { icon: <FaStar className="text-amber-500" />, title: "Loved by thousands", desc: "Join 10,000+ happy shoppers" }
          ].map((item, idx) => (
            <div key={idx} className="glass rounded-2xl p-6 hover-lift shadow-sm">
              <div className="w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CONTACT SECTION ---------- */}
      <section id="contact" className="pt-20 pb-10 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <span className="text-orange-600 text-sm font-bold uppercase tracking-widest bg-orange-100/80 px-5 py-1.5 rounded-full">
              Get in Touch
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-4 mb-3">
              We'd love to hear from you
            </h2>
            <p className="text-gray-500 mb-8">
              Have questions, feedback, or just want to say hi? Reach out anytime.
            </p>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FaPhone className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Phone</p>
                  <p className="text-sm text-gray-500">+233 50 567 1577</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <FaEnvelope className="text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <p className="text-sm text-gray-500">freshyfoodsfactory@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <FaMapMarkerAlt className="text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Address</p>
                  <p className="text-sm text-gray-500">Madina, Lapaz, Accra, Ghana</p>
                </div>
              </div>
            </div>
          </div>

          <form className="glass rounded-2xl p-6 space-y-4 shadow-md">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
              <input type="text" placeholder="Your name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input type="email" placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
              <textarea rows={4} placeholder="How can we help?" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"></textarea>
            </div>
            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-orange-200">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* ---------- DOWNLOAD CTA ---------- */}
      <div id="download" className="max-w-6xl mx-auto mt-24 mb-16 px-4">
        <div className="bg-gray-900 rounded-3xl p-10 md:p-14 text-center shadow-2xl shadow-black/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-500/15 to-transparent" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Ready to skip the market?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
              Download our app for exclusive deals, real‑time tracking, and the freshest groceries at your fingertips.
            </p>

            {/* Download buttons with target="_blank" */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <a
                href="https://apps.apple.com/app/freshyfood-factory/id6762318566"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-white text-gray-900 px-7 py-4 rounded-2xl font-bold hover:bg-gray-100 transition shadow-lg hover:shadow-xl hover:scale-105"
              >
                <FaApple size={22} />
                <div className="text-left">
                  <div className="text-[10px] uppercase opacity-50">Download on the</div>
                  <div>App Store</div>
                </div>
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.freshyfood.factory"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-white text-gray-900 px-7 py-4 rounded-2xl font-bold hover:bg-gray-100 transition shadow-lg hover:shadow-xl hover:scale-105"
              >
                <FaGooglePlay size={20} />
                <div className="text-left">
                  <div className="text-[10px] uppercase opacity-50">Get it on</div>
                  <div>Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- FOOTER ---------- */}
      <footer className="border-t border-white/30 bg-[#e9dccb]/80 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FaLeaf className="text-green-600" />
            <span>© 2025 FreshyFood. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-orange-500 transition">Privacy</a>
            <a href="#" className="hover:text-orange-500 transition">Terms</a>
            <a href="#" className="hover:text-orange-500 transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;