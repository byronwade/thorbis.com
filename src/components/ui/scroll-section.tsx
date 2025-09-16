"use client";

import { ReactNode, useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScrollSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function ScrollSection({ title, children, className = "" }: ScrollSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollButtons);
      return () => scrollElement.removeEventListener('scroll', checkScrollButtons);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Separate description from business cards
  const childrenArray = Array.isArray(children) ? children : [children];
  const description = childrenArray.find(child => 
    child && typeof child === 'object' && 'type' in child && child.type === 'p'
  );
  const businessCards = childrenArray.filter(child => 
    !(child && typeof child === 'object' && 'type' in child && child.type === 'p')
  );

  return (
    <section className={'py-12 ${className}'}>
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          {title}
        </h2>
        
        {/* Render description if present */}
        {description}
        
        <div className="mb-6" />
        
        <div 
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Left Navigation Button */}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={'absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-neutral-950/50 hover:bg-neutral-950/70 text-white rounded-full flex items-center justify-center transition-all duration-200 ${
              canScrollLeft && isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            } disabled:cursor-not-allowed disabled:opacity-30'}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Navigation Button */}
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={'absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-neutral-950/50 hover:bg-neutral-950/70 text-white rounded-full flex items-center justify-center transition-all duration-200 ${
              canScrollRight && isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            } disabled:cursor-not-allowed disabled:opacity-30'}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex gap-6 min-w-max">
              {businessCards}
            </div>
          </div>
          
          {/* Gradient fades */}
          <div className={'absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-black to-transparent pointer-events-none transition-opacity duration-200 ${
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          }'} />
          <div className={'absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-black to-transparent pointer-events-none transition-opacity duration-200 ${
            canScrollRight ? 'opacity-100' : 'opacity-0`
          }'} />
        </div>
      </div>
      
      <style jsx>{'
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      '}</style>
    </section>
  );
}