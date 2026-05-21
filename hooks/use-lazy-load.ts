'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface useLazyLoadProps {
  onVisible?: () => void;
  threshold?: number;
  rootMargin?: string;
}

export const useLazyLoad = ({
  onVisible,
  threshold = 0.01,
  rootMargin = '50px',
}: useLazyLoadProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          try {
            if (entry.isIntersecting) {
              setIsVisible(true);
              onVisible?.();
              observer.unobserve(entry.target);
            }
          } catch (error) {
            console.error('Intersection observer error:', error);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [onVisible, threshold, rootMargin]);

  return { isVisible, elementRef };
};
