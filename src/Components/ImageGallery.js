// src/components/ImageGallery.jsx
import React, { useState, useRef, useEffect } from 'react';

const ImageGallery = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.offsetWidth;
      const index = Math.round(scrollLeft / width);
      setActiveIndex(index);
    }
  };

  const scrollToIndex = (index) => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: width * index,
        behavior: 'smooth',
      });
      setActiveIndex(index);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showLightbox) return;
      if (e.key === 'ArrowLeft' && activeIndex > 0) {
        scrollToIndex(activeIndex - 1);
      } else if (e.key === 'ArrowRight' && activeIndex < images.length - 1) {
        scrollToIndex(activeIndex + 1);
      } else if (e.key === 'Escape') {
        setShowLightbox(false);
      }
    };

    if (showLightbox) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showLightbox, activeIndex, images.length]);

  return (
    <>
      {/* Main Gallery */}
      <div className="relative bg-gray-200">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="min-w-full snap-center cursor-pointer"
              onClick={() => setShowLightbox(true)}
            >
              <div className="relative pt-[88%] sm:pt-[75%] md:pt-[56%] lg:pt-[50%]">
                <img
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && activeIndex > 0 && (
          <button
            onClick={() => scrollToIndex(activeIndex - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors z-10"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-white">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        {images.length > 1 && activeIndex < images.length - 1 && (
          <button
            onClick={() => scrollToIndex(activeIndex + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors z-10"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-white">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}

        {/* Counter */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/45 rounded-full px-3 py-1.5 z-10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-white">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span className="text-white text-xs font-bold">{activeIndex + 1} / {images.length}</span>
          </div>
        )}

        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                className={`rounded-full transition-all duration-300 h-1.5 ${
                  i === activeIndex
                    ? 'w-6 bg-white'
                    : 'w-1.5 bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="bg-black/55 absolute bottom-0 left-0 right-0 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 px-4 py-2">
              {images.map((image, i) => (
                <button
                  key={i}
                  onClick={() => scrollToIndex(i)}
                  className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                    i === activeIndex ? 'border-white opacity-100' : 'border-transparent opacity-60 hover:opacity-80'
                  }`}
                >
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-white">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Image */}
          <img
            src={images[activeIndex]}
            alt={`Product image ${activeIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />

          {/* Navigation */}
          {activeIndex > 0 && (
            <button
              onClick={() => scrollToIndex(activeIndex - 1)}
              className="absolute left-4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 text-white">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          {activeIndex < images.length - 1 && (
            <button
              onClick={() => scrollToIndex(activeIndex + 1)}
              className="absolute right-4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 text-white">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/20 rounded-full px-4 py-2">
            <span className="text-white text-sm font-bold">{activeIndex + 1} / {images.length}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;