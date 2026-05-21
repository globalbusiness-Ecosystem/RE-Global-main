'use client';

import { useEffect, useRef, useCallback } from 'react';

export default function PriceTickerBar() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollPos = 0;
    const maxScroll = container.scrollWidth / 2;

    // Use throttled scroll animation for better performance
    const scroll = () => {
      scrollPos = (scrollPos + 0.5) % maxScroll;
      container.scrollLeft = scrollPos;
      animationIdRef.current = requestAnimationFrame(scroll);
    };

    animationIdRef.current = requestAnimationFrame(scroll);
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  const prices = [
    { symbol: 'BTC', price: '$42,850', change: '+2.5%' },
    { symbol: 'ETH', price: '$2,340', change: '+1.8%' },
    { symbol: 'PI', price: '$0.0285', change: '+0.5%' },
    { symbol: 'BTC', price: '$42,850', change: '+2.5%' },
    { symbol: 'ETH', price: '$2,340', change: '+1.8%' },
    { symbol: 'PI', price: '$0.0285', change: '+0.5%' },
  ];

  return (
    <div className="bg-card border-b border-border overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="flex gap-6 px-4 py-3 overflow-x-auto scrollbar-hide whitespace-nowrap"
      >
        {prices.map((p, i) => (
          <div key={i} className="flex-shrink-0 flex items-center gap-2">
            <span className="text-sm font-semibold text-accent">{p.symbol}</span>
            <span className="text-sm text-foreground">{p.price}</span>
            <span className={`text-xs ${p.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
              {p.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
