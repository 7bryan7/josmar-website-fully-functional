import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Carousel({ items = [], renderItem, autoPlay = false, interval = 5000 }) {
  const containerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScrollLimits = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeftArrow(scrollLeft > 5);
      // Allow minor subpixel deviations (e.g. 2px threshold)
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScrollLimits();
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollLimits);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollLimits);
      }
    };
  }, [items]);

  // Handle autoPlay timer
  useEffect(() => {
    if (!autoPlay || items.length === 0) return;
    const timer = setInterval(() => {
      if (containerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
        const nextPos = scrollLeft + clientWidth;
        if (nextPos >= scrollWidth - 5) {
          containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          containerRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, items]);

  const scroll = (direction) => {
    if (containerRef.current) {
      const clientWidth = containerRef.current.clientWidth;
      const scrollOffset = direction === 'left' ? -clientWidth : clientWidth;
      containerRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="relative group w-full">
      {/* Scrollable Container */}
      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none py-4 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, idx) => (
          <div key={idx} className="flex-shrink-0 snap-start">
            {renderItem(item, idx)}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 md:-ml-6 p-2 rounded-full bg-white shadow-soft border border-slate-100 hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100 z-10"
        >
          <ChevronLeftIcon className="h-5 w-5 text-slate-600" />
        </button>
      )}

      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 md:-mr-6 p-2 rounded-full bg-white shadow-soft border border-slate-100 hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100 z-10"
        >
          <ChevronRightIcon className="h-5 w-5 text-slate-600" />
        </button>
      )}
    </div>
  );
}
