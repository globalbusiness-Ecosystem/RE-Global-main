'use client';
import type { NavLanguage } from '@/lib/nav-i18n';

import { useEffect, useMemo, useState } from 'react';
import { useSiteContent } from '@/lib/useSiteContent';
import { HERO_SLIDES, HERO_STAT_LABELS, tt, type HeroSlideI18n } from '@/lib/hero-i18n';

interface HeroSliderProps {
  language: NavLanguage;
  onInvestClick?: () => void;
  onTokenizedClick?: () => void;
}

function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = value / (duration / 16);
    let animationId: NodeJS.Timeout;

    const animate = () => {
      start += increment;
      if (start < value) {
        setCount(Math.floor(start));
        animationId = setTimeout(animate, 16);
      } else {
        setCount(value);
      }
    };

    animate();
    return () => clearTimeout(animationId);
  }, [value, duration]);

  return (
    <span>
      {count.toLocaleString()}
    </span>
  );
}

export default function HeroSlider({ language, onInvestClick, onTokenizedClick }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fade, setFade] = useState(true);
  const [, setImageLoaded] = useState(false);
  const { items: banners } = useSiteContent<any>('banners');
  const list: (HeroSlideI18n & { link?: string })[] = useMemo(
    () =>
      banners.length
        ? banners.map((b, i) => ({
            id: 1000 + i,
            type: b.buttonLabel ? ('action' as const) : ('hero' as const),
            title: { en: b.title, ar: b.titleAr || b.title } as any,
            subtitle: { en: b.subtitle || '', ar: b.subtitleAr || b.subtitle || '' } as any,
            button: b.buttonLabel ? ({ en: b.buttonLabel, ar: b.buttonLabelAr || b.buttonLabel } as any) : undefined,
            imageUrl: b.image || undefined,
            link: b.link || undefined,
          }))
        : HERO_SLIDES,
    [banners]
  );

  const handleButtonClick = (buttonType: string) => {
    try {
      if (buttonType === 'invest') {
        window.dispatchEvent(new CustomEvent('navigateToPage', { detail: 'invest' }));
        onInvestClick?.();
        setTimeout(() => {
          const listingsElement = document.getElementById('investListings');
          if (listingsElement) {
            listingsElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else if (buttonType === 'tokenized') {
        window.dispatchEvent(new CustomEvent('navigateToPage', { detail: 'tokenized' }));
        onTokenizedClick?.();
      }
    } catch (error) {
      console.error('Button click error:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        setFade(false);
        setImageLoaded(false);
        setTimeout(() => {
          setCurrentSlide((prev) => (prev + 1) % list.length);
          setFade(true);
        }, 300);
      } catch (error) {
        console.error('Slide transition error:', error);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [list.length]);

  const slide = list[currentSlide % list.length];

  return (
    <div className="relative w-full h-96 bg-[#120d2a] overflow-hidden">
      {/* Slide Background */}
      {slide.type !== 'stats' && slide.imageUrl && (
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-300 ${
            fade ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
              url('${slide.imageUrl}')
            `,
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        />
      )}

      {(slide.type === 'stats' || !slide.imageUrl) && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1140] via-[#0c0820] to-[#1a1140]" />
      )}

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className={`text-center text-white px-4 max-w-2xl transition-opacity duration-300 ${
          fade ? 'opacity-100' : 'opacity-0'
        }`}>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-pretty">
            {tt(slide.title, language)}
          </h1>
          <p className="text-lg text-gray-200 max-w-lg mx-auto mb-6">
            {tt(slide.subtitle, language)}
          </p>

          {slide.type === 'action' && slide.button && (
            <button 
              onClick={() => {
                const link = (slide as { link?: string }).link;
                if (link) {
                  window.dispatchEvent(new CustomEvent('navigateToPage', { detail: link }));
                  return;
                }
                if (slide.id === 2) {
                  handleButtonClick('invest');
                } else if (slide.id === 3) {
                  handleButtonClick('tokenized');
                }
              }}
              className="px-8 py-3 rounded-lg font-semibold transition-all duration-200 border-2 cursor-pointer" style={{ 
                borderColor: 'rgb(212, 175, 55)', 
                color: 'rgb(212, 175, 55)',
                backgroundColor: 'rgba(212, 175, 55, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgb(212, 175, 55)';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
                e.currentTarget.style.color = 'rgb(212, 175, 55)';
              }}>
              {tt(slide.button!, language)}
            </button>
          )}

          {slide.type === 'stats' && slide.stats && (
            <div className="grid grid-cols-3 gap-6 mt-8">
              {slide.stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="text-4xl font-bold text-accent mb-2">
                    <AnimatedCounter value={stat.value} duration={2000} />
                    {stat.value > 1000 && <span>K</span>}
                  </div>
                  <p className="text-sm text-gray-300">{tt(HERO_STAT_LABELS[stat.labelKey], language)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {list.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setFade(false);
              setTimeout(() => {
                setCurrentSlide(index);
                setFade(true);
              }, 300);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-accent w-6'
                : 'bg-gray-500 hover:bg-gray-400'
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
