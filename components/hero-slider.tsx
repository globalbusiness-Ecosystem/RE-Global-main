'use client';

import { useEffect, useState } from 'react';

interface Slide {
  id: number;
  type: 'hero' | 'action' | 'stats';
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  buttonEn?: string;
  buttonAr?: string;
  imageUrl?: string;
  stats?: { label: string; value: number }[];
}

interface HeroSliderProps {
  language: 'en' | 'ar';
  onInvestClick?: () => void;
  onTokenizedClick?: () => void;
}

const slides: Slide[] = [
  {
    id: 1,
    type: 'hero',
    titleEn: 'Global Real Estate on Pi',
    titleAr: 'العقارات العالمية على Pi',
    subtitleEn: 'Invest, buy, rent, and explore properties across 195 countries',
    subtitleAr: 'استثمر واشتر وأجّر واستكشف العقارات في 195 دولة',
    imageUrl: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&fit=crop',
  },
  {
    id: 2,
    type: 'action',
    titleEn: 'Investment Opportunities',
    titleAr: 'فرص الاستثمار',
    subtitleEn: 'Build wealth through premium real estate on Pi Network',
    subtitleAr: 'بناء الثروة من خلال العقارات الفاخرة على شبكة Pi',
    buttonEn: 'Invest Now',
    buttonAr: 'استثمر الآن',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&fit=crop',
  },
  {
    id: 3,
    type: 'action',
    titleEn: 'Tokenized Real Estate',
    titleAr: 'العقارات المعمّنة',
    subtitleEn: 'Own fractions of premium properties worldwide',
    subtitleAr: 'امتلك أجزاء من العقارات الفاخرة حول العالم',
    buttonEn: 'Tokenized',
    buttonAr: 'معمّن',
    imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&fit=crop',
  },
  {
    id: 4,
    type: 'stats',
    titleEn: 'Why Join RE?',
    titleAr: 'لماذا تنضم إلى RE؟',
    subtitleEn: 'Trusted by thousands of investors worldwide',
    subtitleAr: 'موثوق من قبل آلاف المستثمرين في جميع أنحاء العالم',
    stats: [
      { label: 'Properties', value: 12500 },
      { label: 'Countries', value: 195 },
      { label: 'Investors', value: 45200 },
    ],
  },
];

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
  const [imageLoaded, setImageLoaded] = useState(false);

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
          setCurrentSlide((prev) => (prev + 1) % slides.length);
          setFade(true);
        }, 300);
      } catch (error) {
        console.error('Slide transition error:', error);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const slide = slides[currentSlide];

  return (
    <div className="relative w-full h-96 bg-black overflow-hidden">
      {/* Slide Background */}
      {slide.type !== 'stats' && (
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

      {slide.type === 'stats' && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      )}

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className={`text-center text-white px-4 max-w-2xl transition-opacity duration-300 ${
          fade ? 'opacity-100' : 'opacity-0'
        }`}>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-pretty">
            {language === 'en' ? slide.titleEn : slide.titleAr}
          </h1>
          <p className="text-lg text-gray-200 max-w-lg mx-auto mb-6">
            {language === 'en' ? slide.subtitleEn : slide.subtitleAr}
          </p>

          {slide.type === 'action' && slide.buttonEn && (
            <button 
              onClick={() => {
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
              {language === 'en' ? slide.buttonEn : slide.buttonAr}
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
                  <p className="text-sm text-gray-300">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
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
