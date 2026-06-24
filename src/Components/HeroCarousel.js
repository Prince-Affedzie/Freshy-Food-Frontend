// src/components/HeroCarousel.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AUTO_SCROLL_INTERVAL = 4200;

const HeroCarousel = ({ slides, onSlidePress }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const timerRef = useRef(null);

  const scrollToIndex = useCallback((index) => {
    if (scrollRef.current) {
      const slideWidth = scrollRef.current.children[0]?.offsetWidth || 0;
      scrollRef.current.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth',
      });
    }
  }, []);

  const startAutoScroll = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % slides.length;
        scrollToIndex(next);
        return next;
      });
    }, AUTO_SCROLL_INTERVAL);
  }, [slides.length, scrollToIndex]);

  useEffect(() => {
    startAutoScroll();
    return () => clearInterval(timerRef.current);
  }, [startAutoScroll]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const slideWidth = scrollRef.current.children[0]?.offsetWidth || 0;
      const scrollLeft = scrollRef.current.scrollLeft;
      const index = Math.round(scrollLeft / slideWidth);
      setActiveIndex(index);
    }
  };

  const handleManualScroll = (index) => {
    scrollToIndex(index);
    setActiveIndex(index);
    clearInterval(timerRef.current);
    startAutoScroll();
  };

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-2xl"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="min-w-full snap-center relative cursor-pointer"
            onClick={() => onSlidePress(slide)}
          >
            <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 overflow-hidden">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              {/* Overlay */}
              <div
                className="absolute inset-0"
                style={{ backgroundColor: slide.overlayColor }}
              />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                <div className="inline-block px-3 py-1.5 rounded-full bg-white/15 border border-white/30 mb-2 sm:mb-3">
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    {slide.tag}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-1 sm:mb-2 drop-shadow-lg whitespace-pre-line">
                  {slide.title}
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-white/80 mb-3 sm:mb-4">
                  {slide.subtitle}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSlidePress(slide);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-2 font-bold text-xs sm:text-sm bg-black/20 hover:bg-black/30 transition-all"
                  style={{ borderColor: slide.accentColor, color: slide.accentColor }}
                >
                  {slide.btnText}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center items-center gap-1.5 py-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => handleManualScroll(i)}
            className={`rounded-full transition-all duration-300 h-1.5 ${
              i === activeIndex
                ? 'w-5 bg-green-900'
                : 'w-1.5 bg-green-200 hover:bg-green-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;